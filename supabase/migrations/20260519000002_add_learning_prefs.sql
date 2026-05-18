-- Adds learning_prefs JSONB column to public.profiles.
-- Stores: { interests: string[], experience: "beginner"|"intermediate"|"advanced", goal: string }

alter table public.profiles
  add column if not exists learning_prefs jsonb default '{}'::jsonb;
