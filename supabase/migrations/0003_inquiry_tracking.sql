alter table public.inquiries
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists consent_at timestamptz;

create table if not exists public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  note text not null check (char_length(note) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.inquiry_notes enable row level security;
drop policy if exists "staff read inquiry notes" on public.inquiry_notes;
create policy "staff read inquiry notes" on public.inquiry_notes for select to authenticated using (public.has_staff_role(array['owner','manager','employee']::public.staff_role[]));
drop policy if exists "staff add own inquiry notes" on public.inquiry_notes;
create policy "staff add own inquiry notes" on public.inquiry_notes for insert to authenticated with check (author_id = (select auth.uid()) and public.has_staff_role(array['owner','manager','employee']::public.staff_role[]));
drop policy if exists "staff delete permitted inquiry notes" on public.inquiry_notes;
create policy "staff delete permitted inquiry notes" on public.inquiry_notes for delete to authenticated using (author_id = (select auth.uid()) or public.has_staff_role(array['owner','manager']::public.staff_role[]));
revoke insert on public.inquiries from anon, authenticated;
grant select, update on public.inquiries to authenticated;
grant select, insert, delete on public.inquiry_notes to authenticated;
