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

    let targetPhone = phone.replace(/[^0-9]/g, '');

    if (!targetPhone) {
      console.error('[Fonnte] Invalid phone number after cleaning:', phone);
      return;
    }

    if (targetPhone.startsWith('0')) {
      targetPhone = '62' + targetPhone.substring(1);
    }

    const payload = {
      target: targetPhone,
      message,
    };

    console.log('[Fonnte] Sending to:', targetPhone);

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': fonnteToken,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Fonnte] API error:', response.status, errorText);
    } else {
      const result = await response.json();
      console.log('[Fonnte] Notification sent successfully:', result);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Fonnte] API timeout after 5 seconds');
    } else {
      console.error('[Fonnte] Failed to send notification:', error);
    }
  }
}

export async function POST(request: Request) {
  try {
    console.log('[Webhook] Received POST request');
    
    let payload: MidtransNotificationPayload;
    
    try {
      const contentType = request.headers.get('content-type');
      console.log('[Webhook] Content-Type:', contentType);
      
      if (contentType?.includes('application/json')) {
        payload = await request.json();
      } else if (contentType?.includes('application/x-www-form-urlencoded') || contentType?.includes('multipart/form-data')) {
        const formData = await request.formData();
        payload = {
          order_id: formData.get('order_id') as string,
          transaction_status: formData.get('transaction_status') as string,
          fraud_status: formData.get('fraud_status') as string,
          status_code: formData.get('status_code') as string,
          gross_amount: formData.get('gross_amount') as string,
          signature_key: formData.get('signature_key') as string,
        };
      } else {
        const text = await request.text();
        console.log('[Webhook] Raw body:', text);
        try {
          payload = JSON.parse(text);
        } catch {
          console.error('[Webhook] Failed to parse body as JSON');
          return NextResponse.json(
            { success: true, message: 'Webhook processed' },
            { status: 200 }
          );
        }
      }
    } catch (parseError) {
      console.error('[Webhook] Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: true, message: 'Webhook processed' },
        { status: 200 }
      );
    }

    const { order_id, transaction_status, fraud_status, status_code, gross_amount, signature_key } = payload;

    console.log('[Webhook] Midtrans Webhook Received:', { 
      order_id, 
      transaction_status, 
      fraud_status, 
      status_code, 
      gross_amount,
      signature_key: signature_key ? signature_key.substring(0, 20) + '...' : 'undefined'
    });

    if (!order_id || !transaction_status || !status_code || !gross_amount || !signature_key) {
      console.error('[Webhook] Missing required fields');
      return NextResponse.json(
        { success: true, message: 'Webhook processed' },
        { status: 200 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    if (!serverKey) {
      console.error('[Webhook] MIDTRANS_SERVER_KEY is not configured');
    }

    const isValidSignature = verifyMidtransNotificationSignature(order_id, status_code, gross_amount, serverKey, signature_key);
    console.log('[Webhook] Signature verification result:', isValidSignature);

    if (!isValidSignature) {
      console.error('[Webhook] Invalid Midtrans signature');
      return NextResponse.json(
        { success: true, message: 'Webhook processed' },
        { status: 200 }
      );
    }

    console.log('[Webhook] Looking up transaction with reference_id:', order_id);
    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('reference_id', order_id)
      .single();

    console.log('[Webhook] Transaction lookup result:', { 
      tx: tx ? { id: tx.id, invitation_id: tx.invitation_id, payment_status: tx.payment_status } : null, 
      txError 
    });

    if (txError || !tx) {
      console.error('[Webhook] Transaction not found:', txError);
      return NextResponse.json(
        { success: true, message: 'Webhook processed' },
        { status: 200 }
      );
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      console.log('[Webhook] Processing settlement/capture for transaction:', tx.id);

      const { error: updateTxError } = await supabaseAdmin
        .from('transactions')
        .update({
          payment_status: 'paid',
          payment_details: {
            transaction_status,
            fraud_status,
            status_code,
            gross_amount,
          },
          webhook_payload: payload as any,
        })
        .eq('reference_id', order_id);

      console.log('[Webhook] Transaction update result:', { error: updateTxError });

      if (tx && tx.invitation_id) {
        const { error: updateInvitationError } = await supabaseAdmin
          .from('invitations')
          .update({
            status: 'active',
            expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', tx.invitation_id);

        console.log('[Webhook] Invitation update result:', { error: updateInvitationError, invitationId: tx.invitation_id });

        const { data: invitation, error: invitationError } = await supabaseAdmin
          .from('invitations')
          .select('slug, user_phone')
          .eq('id', tx.invitation_id)
          .single();

        console.log('[Webhook] Invitation lookup result:', { invitation, invitationError });

        if (invitationError || !invitation) {
          console.error('[Webhook] Invitation not found:', invitationError);
        } else {
          const invitationLink = `https://mari-nikah.vercel.app/p/${invitation.slug}`;
          const waMessage = `Halo! Pembayaran undangan digital Mari Nikah kamu telah BERHASIL! 🎉\n\nLink undangan aktif kamu:\n${invitationLink}\n\nTerima kasih telah mempercayakan momen bahagiamu bersama Mari Nikah.`;

          console.log('[Webhook] Sending Fonnte notification to:', invitation.user_phone);
          console.log('[Webhook] Message:', waMessage);

          sendFonnteNotification(invitation.user_phone, waMessage).then(() => {
            console.log('[Webhook] Fonnte notification completed');
          }).catch((waError) => {
            console.error('[Webhook] Failed to send Fonnte notification:', waError);
          });
        }
      } else {
        console.error('[Webhook] Transaction has no invitation_id:', tx);
      }
    }

    return NextResponse.json(
      { success: true, message: 'Webhook processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Webhook] Error:', error);
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
