-- O destaque "BNCC em foco" lê desta tabela, não de subjects.bncc_codes.
create table if not exists public.bncc_skills (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null,
  school_year text,
  source_reference text,
  created_at timestamptz not null default now()
);

alter table public.bncc_skills enable row level security;
drop policy if exists bncc_skills_read_authenticated on public.bncc_skills;
create policy bncc_skills_read_authenticated on public.bncc_skills
  for select to authenticated using (true);
grant select on public.bncc_skills to authenticated;

-- Depois de criar a tabela, adicione os códigos e descrições oficiais em
-- Supabase → Table Editor → bncc_skills, ou use um INSERT no SQL Editor.
