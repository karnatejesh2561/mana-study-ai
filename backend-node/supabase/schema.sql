-- Supabase schema for ManaStudy AI backend
create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  file_name text not null,
  file_type text,
  storage_path text not null,
  public_url text,
  size_bytes int,
  status text not null default 'uploaded',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table summaries (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  title text not null,
  subject text,
  pages int,
  overview text,
  sections jsonb not null default '[]'::jsonb,
  quick_revision text[] not null default array[]::text[],
  viva_questions text[] not null default array[]::text[],
  formulas text[] not null default array[]::text[],
  concepts text[] not null default array[]::text[],
  definitions text[] not null default array[]::text[],
  exam_tips text[] not null default array[]::text[],
  created_at timestamptz not null default now()
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  summary_id uuid references summaries(id) on delete cascade,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  summary_id uuid references summaries(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  answers jsonb not null default '[]'::jsonb,
  score int not null default 0,
  total int not null default 0,
  percentage int not null default 0,
  attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
