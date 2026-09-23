const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';
const NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mari-nikah.vercel.app';

const MIDTRANS_SNAP_BASE_URL = NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export interface MidtransCustomerDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface MidtransTransactionPayload {
  order_id: string;
  gross_amount: number;
  customer_details: MidtransCustomerDetails;
  callbacks?: {
    finish?: string;
    error?: string;
    cancel?: string;
    pending?: string;
  };
  override_notification_urls?: {
    finish?: string;
    error?: string;
    cancel?: string;
    pending?: string;
  };
}

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export function generateMidtransOrderId(slug: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MN-${timestamp}-${randomSuffix}`;
}

export function createMidtransSignature(orderId: string, statusCode: string, grossAmount: number, serverKey: string): string {
  const data = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const crypto = require('crypto');
  return crypto.createHash('sha512').update(data).digest('hex');
}

export function verifyMidtransNotificationSignature(
  orderId: string,
  statusCode: string,
  grossAmount: number,
  serverKey: string,
  signatureKey: string
): boolean {
  const expectedSignature = createMidtransSignature(orderId, statusCode, grossAmount, serverKey);
  return expectedSignature === signatureKey;
}

export async function createMidtransSnapTransaction(payload: MidtransTransactionPayload): Promise<MidtransSnapResponse> {
  const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

  const response = await fetch(MIDTRANS_SNAP_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: payload.order_id,
        gross_amount: payload.gross_amount,
      },
      customer_details: payload.customer_details,
      callbacks: payload.callbacks || {
        finish: `${NEXT_PUBLIC_BASE_URL}/builder?status=success`,
        error: `${NEXT_PUBLIC_BASE_URL}/builder?status=error`,
        cancel: `${NEXT_PUBLIC_BASE_URL}/builder?status=cancel`,
        pending: `${NEXT_PUBLIC_BASE_URL}/builder?status=pending`,
      },
      override_notification_urls: payload.override_notification_urls || {
        finish: `${NEXT_PUBLIC_BASE_URL}/api/webhook/payment`,
        error: `${NEXT_PUBLIC_BASE_URL}/api/webhook/payment`,
        cancel: `${NEXT_PUBLIC_BASE_URL}/api/webhook/payment`,
        pending: `${NEXT_PUBLIC_BASE_URL}/api/webhook/payment`,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Midtrans API error: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  return {
    token: result.token,
    redirect_url: result.redirect_url,
  };
}

export function getMidtransClientKey(): string {
  return MIDTRANS_CLIENT_KEY;
}

export function isMidtransProduction(): boolean {
  return NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION;
}
