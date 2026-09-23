export interface WhatsAppNotificationPayload {
  phone: string;
  message: string;
}

export async function sendWhatsAppNotification({ phone, message }: WhatsAppNotificationPayload): Promise<{ success: boolean; error?: string }> {
  const gatewayUrl = process.env.WA_GATEWAY_URL;
  const gatewayToken = process.env.WA_GATEWAY_TOKEN;

  if (!gatewayUrl || !gatewayToken) {
    console.warn('WhatsApp gateway credentials are not configured. Skipping notification.');
    return { success: false, error: 'Gateway not configured' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let targetPhone = phone.replace(/[^0-9]/g, '');

    if (!targetPhone) {
      console.warn('Invalid phone number after cleaning:', phone);
      return { success: false, error: 'Invalid phone number' };
    }

    if (targetPhone.startsWith('0')) {
      targetPhone = '62' + targetPhone.substring(1);
    }

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': gatewayToken,
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
      console.error('WhatsApp gateway error:', response.status, errorText);
      return { success: false, error: `Gateway error: ${response.status}` };
    }

    const result = await response.json();
    console.log('WhatsApp notification sent successfully:', result);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('WhatsApp gateway timeout after 5 seconds');
      return { success: false, error: 'Gateway timeout' };
    }

    console.error('Failed to send WhatsApp notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
