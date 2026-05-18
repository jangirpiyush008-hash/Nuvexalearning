-- Adds phone column to public.profiles.
-- Safe to run on existing databases. If the column already exists, this no-ops.

alter table public.profiles
  add column if not exists phone text;
