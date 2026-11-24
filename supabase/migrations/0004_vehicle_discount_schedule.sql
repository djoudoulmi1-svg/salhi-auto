alter table public.vehicles
  add column if not exists discount_percentage integer check (discount_percentage between 1 and 90),
  add column if not exists discount_starts_at timestamptz;
