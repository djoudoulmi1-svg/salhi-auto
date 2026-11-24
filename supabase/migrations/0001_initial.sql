create extension if not exists pgcrypto;

create type public.vehicle_status as enum ('available', 'reserved', 'sold');
create type public.staff_role as enum ('owner', 'manager', 'employee');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9._-]{2,31}$'),
  full_name text not null default '',
  role public.staff_role not null default 'employee',
  is_active boolean not null default true,
  preferred_language text not null default 'ar' check (preferred_language in ('ar','fr','en')),
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  brand text not null,
  model text not null,
  year integer not null check (year between 1950 and 2100),
  price_dzd bigint check (price_dzd >= 0),
  hide_price boolean not null default false,
  status public.vehicle_status not null default 'available',
  fuel text,
  transmission text,
  mileage_km integer check (mileage_km >= 0),
  engine text,
  color text,
  description jsonb not null default '{"ar":"","fr":"","en":""}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  images text[] not null default '{}',
  featured boolean not null default false,
  discount_price_dzd bigint check (discount_price_dzd >= 0),
  discount_ends_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10)),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  customer_name text not null,
  phone text not null,
  wilaya text not null,
  message text,
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.has_staff_role(allowed public.staff_role[])
returns boolean language sql stable security definer set search_path = public
as $$ select auth.uid() is not null and exists(select 1 from public.profiles where id = auth.uid() and role = any(allowed) and is_active = true) $$;

revoke execute on function public.has_staff_role(public.staff_role[]) from public;
grant execute on function public.has_staff_role(public.staff_role[]) to anon, authenticated;

create unique index profiles_single_owner on public.profiles (role) where role = 'owner';

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;

create policy "staff can read profiles" on public.profiles for select to authenticated using (public.has_staff_role(array['owner','manager','employee']::public.staff_role[]));
create policy "owner manages profiles" on public.profiles for all to authenticated using (public.has_staff_role(array['owner']::public.staff_role[])) with check (public.has_staff_role(array['owner']::public.staff_role[]));
create policy "public reads available vehicles" on public.vehicles for select to anon, authenticated using (status = 'available' or public.has_staff_role(array['owner','manager','employee']::public.staff_role[]));
create policy "managers manage vehicles" on public.vehicles for all to authenticated using (public.has_staff_role(array['owner','manager']::public.staff_role[])) with check (public.has_staff_role(array['owner','manager']::public.staff_role[]));
create policy "public creates inquiries" on public.inquiries for insert to anon, authenticated with check (true);
create policy "staff reads inquiries" on public.inquiries for select to authenticated using (public.has_staff_role(array['owner','manager','employee']::public.staff_role[]));
create policy "staff updates inquiries" on public.inquiries for update to authenticated using (public.has_staff_role(array['owner','manager','employee']::public.staff_role[])) with check (public.has_staff_role(array['owner','manager','employee']::public.staff_role[]));
create policy "public reads site settings" on public.site_settings for select to anon, authenticated using (key in ('public_contact','homepage'));
create policy "owner manages settings" on public.site_settings for all to authenticated using (public.has_staff_role(array['owner']::public.staff_role[])) with check (public.has_staff_role(array['owner']::public.staff_role[]));
