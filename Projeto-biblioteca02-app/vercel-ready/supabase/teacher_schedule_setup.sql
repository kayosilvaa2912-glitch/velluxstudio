-- Execute no SQL Editor do mesmo projeto Supabase usado pelo app.
create table if not exists public.teacher_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_name text not null check (char_length(class_name) between 1 and 80),
  subject text not null check (char_length(subject) between 1 and 80),
  room text not null default '' check (char_length(room) <= 100),
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

alter table public.teacher_schedule enable row level security;
drop policy if exists teacher_schedule_owner_all on public.teacher_schedule;
create policy teacher_schedule_owner_all on public.teacher_schedule
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.teacher_schedule to authenticated;
