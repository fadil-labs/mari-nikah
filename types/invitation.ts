export interface InvitationContentData {
  theme: string;
  meta: {
    title?: string;
    description?: string;
    author?: string;
    keywords?: string[];
  };
  couple: {
    groom: {
      full_name: string;
      nickname?: string;
      photo?: string;
      father?: string;
      mother?: string;
    };
    bride: {
      full_name: string;
      nickname?: string;
      photo?: string;
      father?: string;
      mother?: string;
    };
  };
  events: Array<{
    id: string;
    type: 'akad' | 'resepsi' | 'custom';
    title: string;
    date: string;
    time: string;
    location: string;
    address: string;
    maps_url?: string;
    note?: string;
  }>;
  media: {
    cover?: string;
    hero?: string;
    music?: string;
    gallery: string[];
    video?: string;
  };
  love_stories: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
    photo?: string;
  }>;
  digital_gifts: {
    enabled: boolean;
    accounts: Array<{
      bank_name: string;
      account_number: string;
      account_name: string;
      qris_image?: string;
    }>;
  };
  rsvp_settings: {
    enabled: boolean;
    deadline?: string;
    contact_wa?: string;
    message?: string;
  };
}

export type InvitationStatus = 'pending' | 'active' | 'expired';

export interface Invitation {
  id: string;
  user_phone: string;
  slug: string;
  theme_id: string;
  package_id: string;
  content_data: InvitationContentData;
  status: InvitationStatus;
  created_at: string;
  expired_at: string;
  custom_domain?: string;
}

export type PackageId = 'basic' | 'standard' | 'premium' | 'vip' | 'exclusive';

export interface Package {
  id: PackageId;
  name: string;
  price: number;
  active_days: number;
  max_photos: number;
  allow_custom_domain: boolean;
  allow_custom_music: boolean;
}
