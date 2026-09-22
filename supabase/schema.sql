-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- PACKAGES
-- ==========================================
create table packages (
  id text primary key,
  name text not null,
  price integer not null check (price >= 25000 and price <= 1000000),
  active_days integer not null check (active_days >= 30 and active_days <= 365),
  max_photos integer not null,
  allow_custom_domain boolean not null default false,
  allow_custom_music boolean not null default false,
  created_at timestamptz not null default now()
);

alter table packages enable row level security;

create policy "Packages are readable by everyone"
  on packages for select
  to anon, authenticated
  using (true);

insert into packages (id, name, price, active_days, max_photos, allow_custom_domain, allow_custom_music)
values
  ('basic', 'Basic', 25000, 30, 10, false, false),
  ('standard', 'Standard', 50000, 60, 30, false, true),
  ('premium', 'Premium', 150000, 180, 100, true, true),
  ('vip', 'VIP', 300000, 270, 300, true, true),
  ('exclusive', 'Exclusive', 1000000, 365, 1000, true, true);

-- ==========================================
-- INVITATIONS
-- ==========================================
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  user_phone text not null,
  slug text not null unique,
  theme_id text not null default 'elegant',
  package_id text not null references packages(id),
  content_data jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'active', 'expired')),
  created_at timestamptz not null default now(),
  expired_at timestamptz not null default now() + interval '30 days',
  custom_domain text
);

create index idx_invitations_status on invitations(status);
create index idx_invitations_slug on invitations(slug);
create index idx_invitations_user_phone on invitations(user_phone);

alter table invitations enable row level security;

create policy "Active invitations are readable publicly"
  on invitations for select
  to anon, authenticated
  using (status = 'active');

create policy "Users can insert their own invitations"
  on invitations for insert
  to authenticated
  with check (true);

create policy "Users can update their own invitations"
  on invitations for update
  to authenticated
  using (true);

-- ==========================================
-- TRANSACTIONS
-- ==========================================
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  reference_id text not null unique,
  amount integer not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'expired')),
  payment_method text,
  payment_details jsonb default '{}'::jsonb,
  webhook_payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_transactions_reference_id on transactions(reference_id);
create index idx_transactions_invitation_id on transactions(invitation_id);
create index idx_transactions_payment_status on transactions(payment_status);

create index if not exists idx_packages_id on packages(id);

alter table transactions enable row level security;

create policy "Users can view their own transactions"
  on transactions for select
  to authenticated
  using (
    exists (
      select 1 from invitations
      where invitations.id = transactions.invitation_id
        and invitations.user_phone = auth.uid()::text
    )
  );

create policy "System can insert transactions"
  on transactions for insert
  to authenticated, service_role
  with check (true);

create policy "System can update transactions"
  on transactions for update
  to authenticated, service_role
  using (true);

-- ==========================================
-- TRIGGER: auto update updated_at
-- ==========================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_transactions_updated_at
  before update on transactions
  for each row
  execute function update_updated_at_column();
