import crypto from 'crypto';

const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY || '';
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY || '';
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE || '';
const TRIPAY_BASE_URL = process.env.TRIPAY_BASE_URL || 'https://tripay.co.id/api';

export interface TripayInvoicePayload {
  method: string;
  merchant_ref: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_items?: Array<{
    name: string;
    amount: number;
    quantity: number;
  }>;
  callback_url?: string;
  return_url?: string;
  expired_time?: number;
}

export interface TripayInvoiceResponse {
  success: boolean;
  data: {
    reference: string;
    merchant_ref: string;
    payment_url: string;
    qris_url?: string;
    amount: number;
    fee: number;
    total_amount: number;
    method: string;
    status: string;
    expired_time: number;
  };
}

export function createTripaySignature(method: string, merchantRef: string, amount: number): string {
  const data = `${TRIPAY_MERCHANT_CODE}${method}${merchantRef}${amount}`;
  return crypto.createHmac('sha256', TRIPAY_PRIVATE_KEY).update(data).digest('hex');
}

export function verifyTripayCallbackSignature(callbackSignature: string, callbackData: Record<string, unknown>): boolean {
  const signature = crypto
    .createHmac('sha256', TRIPAY_PRIVATE_KEY)
    .update(JSON.stringify(callbackData))
    .digest('hex');

  return signature === callbackSignature;
}

export async function createTripayInvoice(payload: TripayInvoicePayload): Promise<TripayInvoiceResponse> {
  const signature = createTripaySignature(payload.method, payload.merchant_ref, payload.amount);

  const response = await fetch(`${TRIPAY_BASE_URL}/transaction/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      merchant_code: TRIPAY_MERCHANT_CODE,
      signature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tripay API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getTripayPaymentChannels() {
  const response = await fetch(`${TRIPAY_BASE_URL}/merchant/payment-channel`, {
    headers: {
      'Authorization': `Bearer ${TRIPAY_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Tripay API error: ${response.statusText}`);
  }

  return response.json();
}
