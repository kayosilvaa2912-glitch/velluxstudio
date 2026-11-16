-- Execute no SQL Editor do Supabase após conferir os nomes/colunas do schema.
-- Política padrão: dados pessoais só do titular; conteúdo e arquivos pagos só
-- para usuários autenticados com user_access.status = 'ativo' ou administradores.

-- Lista confiável de administradores: nunca derive privilégios apenas de
-- user_metadata, que o próprio usuário pode definir no cadastro.
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.app_admins enable row level security;
revoke all on public.app_admins from public, anon, authenticated;
insert into public.app_admins(user_id)
  select p.id from public.profiles p where p.role = 'admin'
  on conflict (user_id) do nothing;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.app_admins a where a.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_active_material_access()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.is_app_admin() or exists (
    select 1 from public.user_access a
    where a.user_id = (select auth.uid()) and a.status = 'ativo'
  );
$$;

revoke all on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;
revoke all on function public.has_active_material_access() from public, anon;
grant execute on function public.has_active_material_access() to authenticated;

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'zuptos',
  external_event_id text not null,
  event_type text not null default 'unknown',
  processing_status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  note text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
create unique index if not exists webhook_events_provider_event_uidx
  on public.webhook_events(provider, external_event_id);

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
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select, insert, update, delete on public.teacher_schedule to authenticated;

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  updated_at timestamptz not null default now()
);
alter table public.user_progress enable row level security;
drop policy if exists user_progress_owner_all on public.user_progress;
create policy user_progress_owner_all on public.user_progress
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select, insert, update, delete on public.user_progress to authenticated;

-- Substitui políticas anteriores dessas tabelas para que permissões antigas
-- permissivas não se somem às regras abaixo (RLS combina policies com OR).
do $$
declare t text; p record;
begin
  foreach t in array array['profiles','user_access','subjects','materials','material_files','favorites','teacher_notes','access_logs','bncc_skills','products','webhook_events','purchases','entitlements','feedbacks'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
        execute format('drop policy %I on public.%I', p.policyname, t);
      end loop;
    end if;
  end loop;
end $$;

-- profiles.role só pode ser atribuído por operações administrativas confiáveis.
revoke insert, update, delete on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, updated_at) on public.profiles to authenticated;
alter table public.profiles alter column role set default 'user';
create policy profiles_read_self_or_admin on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_app_admin());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy access_read_self_or_admin on public.user_access for select to authenticated
  using (user_id = (select auth.uid()) or public.is_app_admin());
create policy access_admin_write on public.user_access for all to authenticated
  using (public.is_app_admin()) with check (public.is_app_admin());

create policy subjects_read_published_or_admin on public.subjects for select to authenticated
  using (coalesce(published, false) or public.is_app_admin());
create policy subjects_admin_write on public.subjects for all to authenticated
  using (public.is_app_admin()) with check (public.is_app_admin());
create policy materials_read_authenticated on public.materials for select to authenticated
  using (public.has_active_material_access());
create policy materials_admin_write on public.materials for all to authenticated
  using (public.is_app_admin()) with check (public.is_app_admin());
create policy material_files_read_paid on public.material_files for select to authenticated
  using (public.has_active_material_access());
create policy material_files_admin_write on public.material_files for all to authenticated
  using (public.is_app_admin()) with check (public.is_app_admin());

create policy favorites_owner_all on public.favorites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy teacher_notes_owner_all on public.teacher_notes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy access_logs_read_owner_or_admin on public.access_logs for select to authenticated
  using (user_id = (select auth.uid()) or public.is_app_admin());
create policy access_logs_insert_owner on public.access_logs for insert to authenticated
  with check (user_id = (select auth.uid()) and public.has_active_material_access());
create policy access_logs_admin_manage on public.access_logs for all to authenticated
  using (public.is_app_admin()) with check (public.is_app_admin());
create policy bncc_skills_read_authenticated on public.bncc_skills for select to authenticated using (true);
create policy bncc_skills_admin_write on public.bncc_skills for all to authenticated
  using (public.is_app_admin()) with check (public.is_app_admin());

-- Feedback pode ser enviado pelo titular; operações administrativas ficam restritas.
do $$ begin
  if to_regclass('public.feedbacks') is not null then
    alter table public.feedbacks enable row level security;
    drop policy if exists feedbacks_insert_owner on public.feedbacks;
    drop policy if exists feedbacks_read_owner on public.feedbacks;
    drop policy if exists feedbacks_admin_all on public.feedbacks;
    create policy feedbacks_read_owner on public.feedbacks for select to authenticated
      using (user_id = (select auth.uid()) or public.is_app_admin());
    create policy feedbacks_insert_owner on public.feedbacks for insert to authenticated
      with check (user_id = (select auth.uid()));
    create policy feedbacks_admin_all on public.feedbacks for all to authenticated
      using (public.is_app_admin()) with check (public.is_app_admin());
  end if;
end $$;

do $$
declare t text;
begin
  foreach t in array array['products','webhook_events','purchases','entitlements'] loop
    if to_regclass('public.' || t) is not null then
      execute format('create policy %I on public.%I for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin())', t || '_admin_only', t);
    end if;
  end loop;
end $$;

-- O bucket precisa ser PRIVADO. Arquivos só ficam legíveis se houver metadado
-- em material_files e acesso de pagamento ativo. O service role do painel de
-- storage continua podendo administrar arquivos, mas nunca deve ir ao browser.
drop policy if exists materials_vault_paid_read on storage.objects;
drop policy if exists materials_vault_admin_insert on storage.objects;
drop policy if exists materials_vault_admin_update on storage.objects;
drop policy if exists materials_vault_admin_delete on storage.objects;
update storage.buckets set public = false where id = 'materials-vault';
create policy materials_vault_paid_read on storage.objects for select to authenticated
  using (bucket_id = 'materials-vault' and public.has_active_material_access() and exists (
    select 1 from public.material_files mf where mf.file_uri = storage.objects.name
  ));
create policy materials_vault_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'materials-vault' and public.is_app_admin());
create policy materials_vault_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'materials-vault' and public.is_app_admin())
  with check (bucket_id = 'materials-vault' and public.is_app_admin());
create policy materials_vault_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'materials-vault' and public.is_app_admin());

-- A aplicação usa tabelas diretamente via anon key; RLS continua sendo a barreira.
grant select on public.user_access, public.subjects, public.materials, public.material_files,
  public.bncc_skills to authenticated;
grant insert, update, delete on public.user_access, public.subjects, public.materials, public.material_files to authenticated;
grant select, insert, update, delete on public.products, public.webhook_events to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.teacher_notes to authenticated;
grant select, insert on public.access_logs to authenticated;

do $$ begin
  if to_regclass('public.feedbacks') is not null then
    execute 'grant select, insert, update, delete on public.feedbacks to authenticated';
  end if;
end $$;

