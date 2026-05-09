-- Create a table to store shareable (public) audit payloads.
-- Run this in Supabase SQL editor.

create table if not exists public.public_audits (
  id text primary key,
  created_at timestamptz not null default now(),
  audit_result jsonb not null
);

-- Optional: allow anonymous read for shared audits.
-- If you keep RLS enabled, you'd need policies instead.
-- For MVP simplicity, you can disable RLS on this table:
-- alter table public.public_audits disable row level security;
