import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyMidtransNotificationSignature, createMidtransSignature } from '@/lib/payment/midtrans';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

interface MidtransNotificationPayload {
  order_id: string;
  transaction_status: string;
  fraud_status: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}

export async function POST(request: Request) {
  try {
    const payload: MidtransNotificationPayload = await request.json();

    const { order_id, transaction_status, fraud_status, status_code, gross_amount, signature_key } = payload;

    if (!order_id || !transaction_status || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { success: false, message: 'Data callback tidak lengkap' },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isValidSignature = verifyMidtransNotificationSignature(order_id, status_code, parseInt(gross_amount), serverKey, signature_key);

    if (!isValidSignature) {
      console.error('Invalid Midtrans signature:', { order_id, transaction_status });
      return NextResponse.json(
        { success: false, message: 'Signature tidak valid' },
        { status: 401 }
      );
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('reference_id', order_id)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction not found:', transactionError);
      return NextResponse.json(
        { success: false, message: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    let paymentStatus: string;

    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      paymentStatus = 'PAID';
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      paymentStatus = 'FAILED';
    } else {
      paymentStatus = 'pending';
    }

    const { data: updatedTransaction, error: updateTransactionError } = await supabase
      .from('transactions')
      .update({
        payment_status: paymentStatus,
        payment_method: 'midtrans',
        payment_details: {
          transaction_status,
          fraud_status,
          status_code,
          gross_amount,
        },
      })
      .eq('id', transaction.id)
      .select()
      .single();

    if (updateTransactionError || !updatedTransaction) {
      console.error('Failed to update transaction:', updateTransactionError);
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui transaksi' },
        { status: 500 }
      );
    }

    if (paymentStatus === 'PAID') {
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', transaction.invitation_id)
        .single();

      if (invitationError || !invitation) {
        console.error('Invitation not found:', invitationError);
        return NextResponse.json(
          { success: false, message: 'Undangan tidak ditemukan' },
          { status: 404 }
        );
      }

      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('active_days, name')
        .eq('id', invitation.package_id)
        .single();

      if (packageError || !packageData) {
        console.error('Package not found:', packageError);
        return NextResponse.json(
          { success: false, message: 'Paket tidak ditemukan' },
          { status: 404 }
        );
      }

      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + packageData.active_days);

      const { error: updateInvitationError } = await supabase
        .from('invitations')
        .update({
          status: 'active',
          expired_at: expiredAt.toISOString(),
        })
        .eq('id', invitation.id);

      if (updateInvitationError) {
        console.error('Failed to update invitation:', updateInvitationError);
        return NextResponse.json(
          { success: false, message: 'Gagal memperbarui status undangan' },
          { status: 500 }
        );
      }

      console.log(`Payment successful for invitation: ${invitation.slug}`);

      const expiredAtFormatted = new Date(expiredAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/p/${invitation.slug}`;
      const waMessage = `Halo Kak, pembayaran undangan digital Mari Nikah telah berhasil! 🎉

📌 Link Undangan: ${invitationLink}
📌 Masa Aktif s/d: ${expiredAtFormatted}

Terima kasih telah mempercayakan momen bahagia Kakak bersama Mari Nikah!`;

      sendWhatsAppNotification({
        phone: invitation.user_phone,
        message: waMessage,
      }).catch((waError) => {
        console.error('Failed to send WhatsApp notification:', waError);
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook processed successfully',
        data: {
          order_id,
          transaction_status,
          payment_status: paymentStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Webhook endpoint is active' },
    { status: 200 }
  );
}
