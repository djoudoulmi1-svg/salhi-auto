create table if not exists public.consent_logs (
  id uuid primary key default gen_random_uuid(),
  analytics_allowed boolean not null,
  policy_version text not null,
  created_at timestamptz not null default now()
);
alter table public.consent_logs enable row level security;
revoke all on public.consent_logs from anon, authenticated;
grant insert on public.consent_logs to service_role;
