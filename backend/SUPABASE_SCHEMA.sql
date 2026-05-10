-- Create a table to store shareable (public) audit payloads.
-- Run this in Supabase SQL editor.

create table if not exists public.public_audits (
  id text primary key,
  created_at timestamptz not null default now(),
  audit_result jsonb not null
);

-- Phase 4 schema upgrade: add narrative summary fields to existing projects.
alter table public.public_audits
  add column if not exists narrative_summary jsonb,
  add column if not exists narrative_model text,
  add column if not exists narrative_prompt_version text,
  add column if not exists narrative_created_at timestamptz;

-- Optional: allow anonymous read for shared audits.
-- If you keep RLS enabled, you'd need policies instead.
-- For MVP simplicity, you can disable RLS on this table:
-- alter table public.public_audits disable row level security;
