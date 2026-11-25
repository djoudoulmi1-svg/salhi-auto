-- Limit these grants to the backend-only Supabase service role.
-- The public and authenticated roles continue to be governed by their existing RLS policies.
grant usage on schema public to service_role;

grant select, insert, update on table public.profiles to service_role;
grant select, insert, update, delete on table public.vehicles to service_role;
grant select, insert, update, delete on table public.inquiries to service_role;
grant select, insert, delete on table public.inquiry_notes to service_role;
grant select, insert, update on table public.site_settings to service_role;
grant insert on table public.consent_logs to service_role;
