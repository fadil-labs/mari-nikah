import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createMidtransSnapTransaction, generateMidtransOrderId } from '@/lib/payment/midtrans';
import type { InvitationContentData } from '@/types/invitation';

interface CreateInvitationRequest {
  user_phone: string;
  slug: string;
  theme_id: string;
  package_id: string;
  content_data: InvitationContentData;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export async function POST(request: Request) {
  try {
    const body: CreateInvitationRequest = await request.json();

    const {
      user_phone,
      slug,
      theme_id,
      package_id,
      content_data,
      customer_name,
      customer_email,
      customer_phone,
    } = body;

    const normalizedPackageId = package_id.toLowerCase();

    if (!user_phone || !slug || !package_id || !content_data) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    const { data: existingSlug } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: 'Slug sudah digunakan' },
        { status: 409 }
      );
    }

    const { data: packageData } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', normalizedPackageId)
      .single();

    if (!packageData) {
      return NextResponse.json(
        { success: false, message: 'Paket tidak ditemukan' },
        { status: 404 }
      );
    }

    const invitationData = {
      user_phone,
      slug,
      theme_id,
      package_id: normalizedPackageId,
      content_data,
      status: 'pending',
      expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      custom_domain: null,
    };

    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .insert(invitationData)
      .select()
      .single();

    if (invitationError || !invitation) {
      console.error('Failed to create invitation:', invitationError);
      return NextResponse.json(
        { success: false, message: 'Gagal membuat undangan' },
        { status: 500 }
      );
    }

    const orderId = generateMidtransOrderId(slug);
    const transactionData = {
      invitation_id: invitation.id,
      reference_id: orderId,
      amount: packageData.price,
      payment_status: 'pending',
      payment_method: 'midtrans',
    };

    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError || !transaction) {
      console.error('Failed to create transaction:', transactionError);
      await supabaseAdmin.from('invitations').delete().eq('id', invitation.id);
      return NextResponse.json(
        { success: false, message: 'Gagal membuat transaksi' },
        { status: 500 }
      );
    }

    let snapToken = '';
    let paymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/builder?package=${normalizedPackageId}&invitation=${invitation.id}`;

    try {
      const midtransResponse = await createMidtransSnapTransaction({
        order_id: orderId,
        gross_amount: packageData.price,
        customer_details: {
          first_name: customer_name || user_phone,
          last_name: '',
          email: customer_email || `${user_phone}@placeholder.com`,
          phone: customer_phone || user_phone,
        },
      });

      snapToken = midtransResponse.token;
      paymentUrl = midtransResponse.redirect_url;
    } catch (paymentError) {
      console.error('Payment gateway error:', paymentError);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          invitation_id: invitation.id,
          transaction_id: transaction.id,
          order_id: orderId,
          amount: packageData.price,
          package_name: packageData.name,
          snap_token: snapToken,
          payment_url: paymentUrl,
          status: 'pending',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
