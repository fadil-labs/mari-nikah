import type { InvitationContentData } from './invitation';

export interface PackageRow {
  id: string;
  name: string;
  price: number;
  active_days: number;
  max_photos: number;
  allow_custom_domain: boolean;
  allow_custom_music: boolean;
  created_at: string;
}

export interface InvitationRow {
  id: string;
  user_phone: string;
  slug: string;
  theme_id: string;
  package_id: string;
  content_data: InvitationContentData;
  status: 'pending' | 'active' | 'expired';
  created_at: string;
  expired_at: string;
  custom_domain: string | null;
}

export interface TransactionRow {
  id: string;
  invitation_id: string;
  reference_id: string;
  amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'expired';
  payment_method: string | null;
  payment_details: Record<string, unknown>;
  webhook_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      packages: {
        Row: PackageRow;
        Insert: Omit<PackageRow, 'created_at'>;
        Update: Partial<Omit<PackageRow, 'created_at'>>;
      };
      invitations: {
        Row: InvitationRow;
        Insert: Omit<InvitationRow, 'id' | 'created_at'>;
        Update: Partial<Omit<InvitationRow, 'id' | 'created_at'>>;
      };
      transactions: {
        Row: TransactionRow;
        Insert: Omit<TransactionRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TransactionRow, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
