import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { InvitationTemplate } from '@/components/templates/InvitationTemplate';
import type { Database } from '@/types/database';
import type { Metadata } from 'next';

type Invitation = Database['public']['Tables']['invitations']['Row'];

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getInvitation(slug: string): Promise<Invitation | null> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const invitation = await getInvitation(resolvedParams.slug);

  if (!invitation) {
    return {
      title: 'Undangan Tidak Ditemukan | Mari Nikah',
    };
  }

  const contentData = invitation.content_data as Invitation['content_data'];
  const groom = contentData?.couple?.groom?.full_name || '';
  const bride = contentData?.couple?.bride?.full_name || '';

  return {
    title: `${groom} & ${bride} - Undangan Pernikahan | Mari Nikah`,
    description: contentData?.meta?.description || `Undangan pernikahan ${groom} & ${bride}`,
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const resolvedParams = await params;
  const invitation = await getInvitation(resolvedParams.slug);

  if (!invitation) {
    notFound();
  }

  if (invitation.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary-light to-white">
        <div className="text-center px-6 max-w-md">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-3xl font-serif text-dark mb-4">Masa Aktif Undangan Telah Habis</h1>
          <p className="text-dark/60">
            Maaf, undangan yang Anda cari telah expired. Silakan hubungi pemilik undangan untuk informasi lebih lanjut.
          </p>
        </div>
      </div>
    );
  }

  if (invitation.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary-light to-white">
        <div className="text-center px-6 max-w-md">
          <div className="text-6xl mb-6">📋</div>
          <h1 className="text-3xl font-serif text-dark mb-4">Undangan Belum Aktif</h1>
          <p className="text-dark/60">
            Undangan ini sedang dalam proses pembayaran dan belum aktif. Silakan coba lagi nanti.
          </p>
        </div>
      </div>
    );
  }

  const contentData = invitation.content_data as Invitation['content_data'];

  return <InvitationTemplate contentData={contentData} />;
}

export const dynamic = 'force-dynamic';
