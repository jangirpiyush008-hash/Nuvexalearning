-- Nuvexa Studio — initial schema
-- Convention: money stored as integer paise (INR) or cents (USD). Never float.
-- Timezone: server timestamps stored as timestamptz UTC, rendered IST client-side.

set time zone 'UTC';

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- ============================================================================
-- profiles
-- ============================================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null check (char_length(username) between 3 and 30),
  display_name    text not null,
  avatar_url      text,
  bio             text check (char_length(bio) <= 280),
  link            text,
  is_instructor   boolean not null default false,
  is_verified     boolean not null default false,
  is_public       boolean not null default true,
  created_at      timestamptz not null default now()
);
create index profiles_username_idx on public.profiles (lower(username));
create index profiles_is_instructor_idx on public.profiles (is_instructor) where is_instructor = true;

-- ============================================================================
-- courses
-- ============================================================================
create table public.courses (
  id                  uuid primary key default gen_random_uuid(),
  instructor_id       uuid not null references public.profiles(id) on delete cascade,
  title               text not null,
  slug                text unique not null,
  description         text,
  thumbnail_url       text,
  price_inr_paise     integer not null check (price_inr_paise >= 0),
  price_usd_cents     integer not null check (price_usd_cents >= 0),
  trial_seconds       integer not null default 60 check (trial_seconds between 0 and 600),
  total_lessons       integer not null default 0,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now()
);
create index courses_instructor_idx on public.courses (instructor_id);
create index courses_published_idx on public.courses (is_published, created_at desc) where is_published = true;

-- ============================================================================
-- lessons
-- ============================================================================
create table public.lessons (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid not null references public.courses(id) on delete cascade,
  position            integer not null check (position >= 0),
  title               text not null,
  video_stream_id     text,  -- Cloudflare Stream uid
  pdf_storage_path    text,  -- Supabase Storage path
  duration_seconds    integer not null default 0 check (duration_seconds >= 0),
  is_trial            boolean not null default false,
  created_at          timestamptz not null default now(),
  unique (course_id, position)
);
create index lessons_course_idx on public.lessons (course_id, position);
-- Only one trial lesson per course
create unique index lessons_one_trial_per_course
  on public.lessons (course_id) where is_trial = true;

-- ============================================================================
-- enrollments
-- ============================================================================
create table public.enrollments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  course_id           uuid not null references public.courses(id) on delete cascade,
  purchased_at        timestamptz not null default now(),
  completion_pct      numeric(5,2) not null default 0 check (completion_pct between 0 and 100),
  last_lesson_id      uuid references public.lessons(id) on delete set null,
  completed_at        timestamptz,
  unique (user_id, course_id)
);
create index enrollments_user_idx on public.enrollments (user_id, purchased_at desc);
create index enrollments_course_idx on public.enrollments (course_id);

-- ============================================================================
-- lesson_progress
-- ============================================================================
create table public.lesson_progress (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  lesson_id           uuid not null references public.lessons(id) on delete cascade,
  watched_seconds     integer not null default 0 check (watched_seconds >= 0),
  completed_at        timestamptz,
  updated_at          timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index lesson_progress_user_idx on public.lesson_progress (user_id);

-- ============================================================================
-- voices (reviews wall, threaded)
-- ============================================================================
create table public.voices (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  course_id           uuid not null references public.courses(id) on delete cascade,
  rating              smallint check (rating between 1 and 5),
  text                text not null check (char_length(text) between 1 and 2000),
  screenshot_url      text,
  outcome_tags        text[] not null default '{}',
  is_public           boolean not null default true,
  helpful_count       integer not null default 0 check (helpful_count >= 0),
  parent_voice_id     uuid references public.voices(id) on delete cascade,
  created_at          timestamptz not null default now()
);
create index voices_course_created_idx on public.voices (course_id, created_at desc) where is_public = true;
create index voices_user_idx on public.voices (user_id, created_at desc);
create index voices_parent_idx on public.voices (parent_voice_id) where parent_voice_id is not null;

-- ============================================================================
-- voice_reactions
-- ============================================================================
create type voice_reaction_type as enum ('helpful', 'inspiring', 'save');

create table public.voice_reactions (
  id                  uuid primary key default gen_random_uuid(),
  voice_id            uuid not null references public.voices(id) on delete cascade,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  reaction_type       voice_reaction_type not null,
  created_at          timestamptz not null default now(),
  unique (voice_id, user_id, reaction_type)
);
create index voice_reactions_voice_idx on public.voice_reactions (voice_id);

-- ============================================================================
-- tests
-- ============================================================================
create table public.tests (
  id                      uuid primary key default gen_random_uuid(),
  course_id               uuid not null unique references public.courses(id) on delete cascade,
  question_pool           jsonb not null default '[]'::jsonb,
  pass_threshold_pct      numeric(5,2) not null default 70 check (pass_threshold_pct between 0 and 100),
  reward_threshold_pct    numeric(5,2) not null default 95 check (reward_threshold_pct between 0 and 100),
  attempt_cooldown_days   integer not null default 30 check (attempt_cooldown_days >= 0),
  retake_fee_paise        integer not null default 9900 check (retake_fee_paise >= 0),
  created_at              timestamptz not null default now()
);

-- ============================================================================
-- test_attempts
-- ============================================================================
create table public.test_attempts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  course_id           uuid not null references public.courses(id) on delete cascade,
  started_at          timestamptz not null default now(),
  submitted_at        timestamptz,
  score_pct           numeric(5,2) check (score_pct between 0 and 100),
  answers             jsonb not null default '{}'::jsonb,
  reward_granted      boolean not null default false,
  retake_fee_paid     boolean not null default false
);
create index test_attempts_user_course_idx on public.test_attempts (user_id, course_id, started_at desc);

-- ============================================================================
-- credits_wallet
-- ============================================================================
create table public.credits_wallet (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null unique references public.profiles(id) on delete cascade,
  balance_paise           bigint not null default 0 check (balance_paise >= 0),
  lifetime_earned_paise   bigint not null default 0 check (lifetime_earned_paise >= 0),
  lifetime_spent_paise    bigint not null default 0 check (lifetime_spent_paise >= 0),
  updated_at              timestamptz not null default now()
);

-- ============================================================================
-- credit_transactions
-- ============================================================================
create type credit_txn_type as enum ('earned', 'spent', 'expired', 'refunded');

create table public.credit_transactions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  amount_paise        bigint not null,
  type                credit_txn_type not null,
  reference_id        uuid,
  description         text not null,
  created_at          timestamptz not null default now(),
  expires_at          timestamptz
);
create index credit_txn_user_idx on public.credit_transactions (user_id, created_at desc);
create index credit_txn_expiry_idx on public.credit_transactions (expires_at) where expires_at is not null and type = 'earned';

-- ============================================================================
-- certificates
-- ============================================================================
create table public.certificates (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  course_id           uuid not null references public.courses(id) on delete cascade,
  score_pct           numeric(5,2) not null,
  issued_at           timestamptz not null default now(),
  certificate_url     text,
  unique (user_id, course_id)
);

-- ============================================================================
-- follows
-- ============================================================================
create table public.follows (
  follower_id         uuid not null references public.profiles(id) on delete cascade,
  followed_id         uuid not null references public.profiles(id) on delete cascade,
  created_at          timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index follows_followed_idx on public.follows (followed_id);

-- ============================================================================
-- iap_receipts
-- ============================================================================
create table public.iap_receipts (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  transaction_id          text not null unique,
  original_transaction_id text not null,
  product_id              text not null,
  verified_at             timestamptz not null default now(),
  raw_receipt             jsonb not null
);
create index iap_receipts_user_idx on public.iap_receipts (user_id);
create index iap_receipts_product_idx on public.iap_receipts (product_id);

-- ============================================================================
-- notifications
-- ============================================================================
create table public.notifications (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  type                text not null,
  title               text not null,
  body                text not null,
  payload             jsonb not null default '{}'::jsonb,
  read_at             timestamptz,
  created_at          timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

-- ============================================================================
-- reward_pools (throttle ₹10,000 prize: top N/month/course)
-- ============================================================================
create table public.reward_pools (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid not null references public.courses(id) on delete cascade,
  month               date not null,  -- first day of month
  max_winners         integer not null default 100 check (max_winners >= 0),
  current_winners     integer not null default 0 check (current_winners >= 0),
  unique (course_id, month)
);

-- ============================================================================
-- trigger: keep credits_wallet.updated_at fresh
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

create trigger trg_credits_wallet_touch
  before update on public.credits_wallet
  for each row execute function public.touch_updated_at();

create trigger trg_lesson_progress_touch
  before update on public.lesson_progress
  for each row execute function public.touch_updated_at();
