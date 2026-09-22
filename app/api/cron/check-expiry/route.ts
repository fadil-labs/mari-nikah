import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const nowIso = now.toISOString();

    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysFromNowIso = sevenDaysFromNow.toISOString();

    const startOfSevenDays = new Date(sevenDaysFromNow);
    startOfSevenDays.setHours(0, 0, 0, 0);
    const endOfSevenDays = new Date(sevenDaysFromNow);
    endOfSevenDays.setHours(23, 59, 59, 999);

    const { data: expiredInvitations, error: expiredError } = await supabase
      .from('invitations')
      .select('id, slug, user_phone, expired_at')
      .eq('status', 'active')
      .lte('expired_at', nowIso);

    if (expiredError) {
      console.error('Failed to fetch expired invitations:', expiredError);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data undangan expired' },
        { status: 500 }
      );
    }

    let expiredCount = 0;

    if (expiredInvitations && expiredInvitations.length > 0) {
      const expiredIds = expiredInvitations.map((inv) => inv.id);

      const { error: updateExpiredError } = await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .in('id', expiredIds);

      if (updateExpiredError) {
        console.error('Failed to update expired invitations:', updateExpiredError);
      } else {
        expiredCount = expiredInvitations.length;
        console.log(`Auto-expired ${expiredCount} invitations`);
      }
    }

    const { data: reminderInvitations, error: reminderError } = await supabase
      .from('invitations')
      .select('id, slug, user_phone, expired_at')
      .eq('status', 'active')
      .gte('expired_at', startOfSevenDays.toISOString())
      .lte('expired_at', endOfSevenDays.toISOString());

    if (reminderError) {
      console.error('Failed to fetch reminder invitations:', reminderError);
    }

    let reminderSentCount = 0;

    if (reminderInvitations && reminderInvitations.length > 0) {
      for (const invitation of reminderInvitations) {
        try {
          const expiredAtFormatted = new Date(invitation.expired_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          const message = `Halo Kak, masa aktif undangan Mari Nikah (${invitation.slug}) akan habis dalam 7 hari (${expiredAtFormatted}). Kakak dapat memperpanjang masa aktif melalui dashboard kami.`;

          const result = await sendWhatsAppNotification({
            phone: invitation.user_phone,
            message,
          });

          if (result.success) {
            reminderSentCount++;
          }
        } catch (error) {
          console.error(`Failed to send reminder for invitation ${invitation.slug}:`, error);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          expired_count: expiredCount,
          reminder_sent_count: reminderSentCount,
          timestamp: nowIso,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
