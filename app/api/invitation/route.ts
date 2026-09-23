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

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Supabase query timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export async function POST(request: Request) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { message: 'Server configuration error: Service role key missing' },
        { status: 500 }
      );
    }

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

    const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    let finalSlug = normalizedSlug;
    let slugSuffix = 1;

    while (true) {
      const { data: existingSlug } = await withTimeout<{ data: { id: string } | null; error: Error | null }>(
        (supabaseAdmin as any)
          .from('invitations')
          .select('id')
          .eq('slug', finalSlug)
          .single()
      );

      if (!existingSlug) {
        break;
      }

      finalSlug = `${normalizedSlug}-${slugSuffix}`;
      slugSuffix += 1;
    }

    const { data: packageData } = await withTimeout<{ data: { id: string; name: string; price: number; active_days: number } | null; error: Error | null }>(
      (supabaseAdmin as any)
        .from('packages')
        .select('*')
        .eq('id', normalizedPackageId)
        .single()
    );

    if (!packageData) {
      return NextResponse.json(
        { success: false, message: 'Paket tidak ditemukan' },
        { status: 404 }
      );
    }

    const invitationData = {
      user_phone,
      slug: finalSlug,
      theme_id,
      package_id: normalizedPackageId,
      content_data,
      status: 'pending',
      expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      custom_domain: null,
    };

    const { data: invitation, error: invitationError } = await withTimeout<{ data: { id: string } | null; error: Error | null }>(
      (supabaseAdmin as any)
        .from('invitations')
        .insert(invitationData)
        .select()
        .single()
    );

    if (invitationError || !invitation) {
      console.error('Failed to create invitation:', invitationError);
      return NextResponse.json(
        { success: false, message: 'Gagal membuat undangan' },
        { status: 500 }
      );
    }

    const orderId = generateMidtransOrderId(finalSlug);
    const transactionData = {
      invitation_id: invitation.id,
      reference_id: orderId,
      amount: packageData.price,
      payment_status: 'pending',
      payment_method: 'midtrans',
    };

    const { data: transaction, error: transactionError } = await withTimeout<{ data: { id: string; invitation_id: string } | null; error: Error | null }>(
      (supabaseAdmin as any)
        .from('transactions')
        .insert(transactionData)
        .select()
        .single()
    );

    if (transactionError || !transaction) {
      console.error('Failed to create transaction:', transactionError);
      await withTimeout(
        (supabaseAdmin as any).from('invitations').delete().eq('id', invitation.id)
      );
      return NextResponse.json(
        { success: false, message: 'Gagal membuat transaksi' },
        { status: 500 }
      );
    }

    let snapToken = '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mari-nikah.vercel.app';
    let paymentUrl = `${baseUrl}/builder?package=${normalizedPackageId}&invitation=${invitation.id}`;

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
      return NextResponse.json(
        {
          success: false,
          message: paymentError instanceof Error ? paymentError.message : 'Gagal membuat transaksi Midtrans',
        },
        { status: 500 }
      );
    }

    if (!snapToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Midtrans tidak mengembalikan snap_token. Periksa konfigurasi server key dan client key.',
        },
        { status: 500 }
      );
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
