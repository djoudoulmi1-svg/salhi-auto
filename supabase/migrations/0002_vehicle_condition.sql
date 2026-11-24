alter table public.vehicles
  add column if not exists condition text not null default 'used'
  check (condition in ('new', 'used'));
