import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyMidtransNotificationSignature } from '@/lib/payment/midtrans';

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

    const targetPhone = phone.replace(/[^0-9]/g, '');

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': fonnteToken,
      },
      body: JSON.stringify({
        target: targetPhone,
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

    console.log('Midtrans Webhook Received:', { order_id, transaction_status });

    if (!order_id || !transaction_status || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { success: true, message: 'Webhook processed' },
        { status: 200 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isValidSignature = verifyMidtransNotificationSignature(order_id, status_code, parseInt(gross_amount), serverKey, signature_key);

    if (!isValidSignature) {
      console.error('Invalid Midtrans signature:', { order_id, transaction_status });
      return NextResponse.json(
        { success: true, message: 'Webhook processed' },
        { status: 200 }
      );
    }

    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('reference_id', order_id)
      .single();

    if (txError || !tx) {
      console.error('Transaction not found:', txError);
      return NextResponse.json(
        { success: true, message: 'Webhook processed' },
        { status: 200 }
      );
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      await supabaseAdmin
        .from('transactions')
        .update({
          payment_status: 'success',
          webhook_payload: payload as any,
        })
        .eq('reference_id', order_id);

      if (tx && tx.invitation_id) {
        await supabaseAdmin
          .from('invitations')
          .update({
            status: 'active',
            expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', tx.invitation_id);

        const { data: invitation, error: invitationError } = await supabaseAdmin
          .from('invitations')
          .select('slug, user_phone')
          .eq('id', tx.invitation_id)
          .single();

        if (invitationError || !invitation) {
          console.error('Invitation not found:', invitationError);
        } else {
          const invitationLink = `https://mari-nikah.vercel.app/p/${invitation.slug}`;
          const waMessage = `Halo! Pembayaran undangan digital Mari Nikah kamu telah BERHASIL! 🎉\n\nLink undangan aktif kamu:\n${invitationLink}\n\nTerima kasih telah mempercayakan momen bahagiamu bersama Mari Nikah.`;

          sendFonnteNotification(invitation.user_phone, waMessage).catch((waError) => {
            console.error('Failed to send Fonnte notification:', waError);
          });
        }
      }
    }

    return NextResponse.json(
      { success: true, message: 'Webhook processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: true, message: 'Webhook processed' },
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
