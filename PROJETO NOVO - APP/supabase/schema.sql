-- Biblioteca do Professor: esquema inicial.
-- Execute no SQL Editor do Supabase antes de testar a aplicação.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'teacher' check (role in ('teacher','admin')),
  access_status text not null default 'pending' check (access_status in ('pending','active','suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  grade smallint not null check (grade between 6 and 9),
  bimester smallint not null check (bimester between 1 and 4),
  content_area text not null,
  resource_type text not null check (resource_type in ('aula','atividade','avaliacao','gabarito','orientacao','sequencia')),
  bncc_skills text[] not null default '{}',
  search_text text not null default '',
  published boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resource_files (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  label text not null,
  file_path text not null,
  file_format text,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, resource_id)
);

create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  resource_id uuid references public.resources(id) on delete set null,
  action text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'manual',
  external_order_id text unique,
  status text not null default 'active' check (status in ('active','revoked','refunded')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.resource_files enable row level security;
alter table public.favorites enable row level security;
alter table public.access_logs enable row level security;
alter table public.entitlements enable row level security;

-- Helper functions avoid trusting client-supplied role values.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.access_status = 'active') $$;

create or replace function public.has_library_access()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id = auth.uid() and p.access_status = 'active')
 or exists(select 1 from public.entitlements e where e.user_id = auth.uid() and e.status = 'active' and (e.ends_at is null or e.ends_at > now())) $$;

create policy "profile read own or admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "admin manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "active members read published resources" on public.resources for select to authenticated using (published = true and public.has_library_access() or public.is_admin());
create policy "admin manage resources" on public.resources for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "members read resource file metadata" on public.resource_files for select to authenticated using (public.has_library_access() or public.is_admin());
create policy "admin manage resource files" on public.resource_files for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users manage own favorites" on public.favorites for all to authenticated using (user_id = auth.uid() and public.has_library_access()) with check (user_id = auth.uid() and public.has_library_access());
create policy "users read own logs" on public.access_logs for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "users insert own logs" on public.access_logs for insert to authenticated with check (user_id = auth.uid() and public.has_library_access());
create policy "users read own entitlements" on public.entitlements for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin manage entitlements" on public.entitlements for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Private bucket: do not make this bucket public.
insert into storage.buckets (id, name, public) values ('materiais','materiais',false)
on conflict (id) do nothing;

create policy "authorized users read private materials" on storage.objects
for select to authenticated using (
  bucket_id = 'materiais' and (public.has_library_access() or public.is_admin())
);
create policy "admins upload materials" on storage.objects
for insert to authenticated with check (bucket_id = 'materiais' and public.is_admin());
create policy "admins update materials" on storage.objects
for update to authenticated using (bucket_id = 'materiais' and public.is_admin())
with check (bucket_id = 'materiais' and public.is_admin());
create policy "admins delete materials" on storage.objects
for delete to authenticated using (bucket_id = 'materiais' and public.is_admin());

-- Create a profile on signup. New users are pending until admin/payment grants access.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, role, access_status)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'teacher', 'pending');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- After creating your own account, promote it manually in the SQL editor:
-- update public.profiles set role='admin', access_status='active' where id='UUID-DO-USUARIO';
-- For a paid teacher, create an active entitlement and set profile access_status='active'.
