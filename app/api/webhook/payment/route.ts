import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyMidtransNotificationSignature, createMidtransSignature } from '@/lib/payment/midtrans';

interface MidtransNotificationPayload {
  order_id: string;
  transaction_status: string;
  fraud_status: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}

async function sendFonnteNotification(phone: string, message: string): Promise<void> {
  const fonnteToken = process.env.FONNTE_TOKEN || 'rdSW4BRTaS12YdiUAFJbMNS2qvGTbsrWPjs6VbRnCTU8pJdb9';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': fonnteToken,
      },
      body: JSON.stringify({
        target: phone,
        message,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fonnte API error:', response.status, errorText);
    } else {
      console.log('Fonnte notification sent successfully');
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Fonnte API timeout after 5 seconds');
    } else {
      console.error('Failed to send Fonnte notification:', error);
    }
  }
}

export async function POST(request: Request) {
  try {
    const payload: MidtransNotificationPayload = await request.json();

    const { order_id, transaction_status, fraud_status, status_code, gross_amount, signature_key } = payload;

    if (!order_id || !transaction_status || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { status: 'OK', message: 'Notification processed' },
        { status: 200 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isValidSignature = verifyMidtransNotificationSignature(order_id, status_code, parseInt(gross_amount), serverKey, signature_key);

    if (!isValidSignature) {
      console.error('Invalid Midtrans signature:', { order_id, transaction_status });
      return NextResponse.json(
        { status: 'OK', message: 'Notification processed' },
        { status: 200 }
      );
    }

    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('reference_id', order_id)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction not found:', transactionError);
      return NextResponse.json(
        { status: 'OK', message: 'Notification processed' },
        { status: 200 }
      );
    }

    let paymentStatus: string;

    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      paymentStatus = 'success';
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      paymentStatus = 'failed';
    } else {
      paymentStatus = 'pending';
    }

    await supabaseAdmin
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
      .eq('id', transaction.id);

    if (paymentStatus === 'success') {
      const { data: invitation, error: invitationError } = await supabaseAdmin
        .from('invitations')
        .select('*')
        .eq('id', transaction.invitation_id)
        .single();

      if (invitationError || !invitation) {
        console.error('Invitation not found:', invitationError);
        return NextResponse.json(
          { status: 'OK', message: 'Notification processed' },
          { status: 200 }
        );
      }

      const { data: packageData, error: packageError } = await supabaseAdmin
        .from('packages')
        .select('active_days, name')
        .eq('id', invitation.package_id)
        .single();

      if (packageError || !packageData) {
        console.error('Package not found:', packageError);
        return NextResponse.json(
          { status: 'OK', message: 'Notification processed' },
          { status: 200 }
        );
      }

      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + packageData.active_days);

      await supabaseAdmin
        .from('invitations')
        .update({
          status: 'active',
          expired_at: expiredAt.toISOString(),
        })
        .eq('id', invitation.id);

      console.log(`Payment successful for invitation: ${invitation.slug}`);

      const invitationLink = `https://mari-nikah.vercel.app/p/${invitation.slug}`;
      const waMessage = `Halo! Pembayaran undangan digital Mari Nikah kamu telah BERHASIL! 🎉\n\nLink undangan aktif kamu: ${invitationLink}\n\nTerima kasih telah mempercayakan momen bahagiamu bersama Mari Nikah.`;

      sendFonnteNotification(invitation.user_phone, waMessage).catch((waError) => {
        console.error('Failed to send Fonnte notification:', waError);
      });
    }

    return NextResponse.json(
      { status: 'OK', message: 'Notification processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { status: 'OK', message: 'Notification processed' },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Webhook endpoint is active' },
    { status: 200 }
  );
}
