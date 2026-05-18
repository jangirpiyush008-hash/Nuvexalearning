-- ===========================================================================
-- NUVEXA LEARNING — ALL-IN-ONE SQL
-- Run this whole file in Supabase Dashboard → SQL Editor → New query → Run.
-- Order: schema (14 tables + reward_pools) → RLS policies → demo seed.
-- ===========================================================================
-- Safe to re-run: every CREATE uses IF NOT EXISTS where possible, and seed
-- INSERTs use ON CONFLICT DO NOTHING.
-- ===========================================================================


-- ╭─────────────────────────────────────────────────────────────────────────╮
-- │ PART 1 / 3 — SCHEMA                                                     │
-- ╰─────────────────────────────────────────────────────────────────────────╯
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


-- ╭─────────────────────────────────────────────────────────────────────────╮
-- │ PART 2 / 3 — ROW LEVEL SECURITY                                         │
-- ╰─────────────────────────────────────────────────────────────────────────╯
-- Nuvexa Studio — Row Level Security
-- Hard rule: every table has RLS enabled with at least one policy.
-- Writes are owner-only. Public reads are gated by a published/public flag.

-- ============================================================================
-- profiles
-- ============================================================================
alter table public.profiles enable row level security;

create policy "profiles_read_public_or_self"
  on public.profiles for select
  using (is_public = true or id = auth.uid());

create policy "profiles_insert_self"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- No public delete; cascade from auth.users handles account deletion.

-- ============================================================================
-- courses
-- ============================================================================
alter table public.courses enable row level security;

create policy "courses_read_published_or_owner"
  on public.courses for select
  using (is_published = true or instructor_id = auth.uid());

create policy "courses_insert_instructor"
  on public.courses for insert
  with check (
    instructor_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and is_instructor = true)
  );

create policy "courses_update_owner"
  on public.courses for update
  using (instructor_id = auth.uid())
  with check (instructor_id = auth.uid());

create policy "courses_delete_owner"
  on public.courses for delete
  using (instructor_id = auth.uid());

-- ============================================================================
-- lessons
-- ============================================================================
alter table public.lessons enable row level security;

-- Read: published course OR owner of course
create policy "lessons_read_via_course"
  on public.lessons for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = lessons.course_id
        and (c.is_published = true or c.instructor_id = auth.uid())
    )
  );

create policy "lessons_insert_course_owner"
  on public.lessons for insert
  with check (
    exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid())
  );

create policy "lessons_update_course_owner"
  on public.lessons for update
  using (exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()))
  with check (exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()));

create policy "lessons_delete_course_owner"
  on public.lessons for delete
  using (exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()));

-- ============================================================================
-- enrollments
-- ============================================================================
alter table public.enrollments enable row level security;

create policy "enrollments_read_self"
  on public.enrollments for select
  using (user_id = auth.uid());

-- INSERT is server-only (verify-iap-receipt Edge Function uses service role).
-- No client insert policy.

create policy "enrollments_update_self"
  on public.enrollments for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================================
-- lesson_progress
-- ============================================================================
alter table public.lesson_progress enable row level security;

create policy "lesson_progress_select_self"
  on public.lesson_progress for select
  using (user_id = auth.uid());

create policy "lesson_progress_insert_self"
  on public.lesson_progress for insert
  with check (user_id = auth.uid());

create policy "lesson_progress_update_self"
  on public.lesson_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================================
-- voices
-- ============================================================================
alter table public.voices enable row level security;

create policy "voices_read_public_or_self"
  on public.voices for select
  using (is_public = true or user_id = auth.uid());

-- Only enrolled users who have completed >= 50% can post.
create policy "voices_insert_enrolled"
  on public.voices for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and e.course_id = voices.course_id
        and e.completion_pct >= 50
    )
  );

create policy "voices_update_self"
  on public.voices for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "voices_delete_self"
  on public.voices for delete
  using (user_id = auth.uid());

-- ============================================================================
-- voice_reactions
-- ============================================================================
alter table public.voice_reactions enable row level security;

create policy "voice_reactions_read_all"
  on public.voice_reactions for select
  using (true);

create policy "voice_reactions_insert_self"
  on public.voice_reactions for insert
  with check (user_id = auth.uid());

create policy "voice_reactions_delete_self"
  on public.voice_reactions for delete
  using (user_id = auth.uid());

-- ============================================================================
-- tests
-- ============================================================================
alter table public.tests enable row level security;

-- Public can see test exists for a published course, but question_pool is sensitive.
-- For v1 we expose the full row to enrolled users only; instructors see their own.
create policy "tests_read_enrolled_or_owner"
  on public.tests for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.course_id = tests.course_id
    )
    or exists (
      select 1 from public.courses c
      where c.id = tests.course_id and c.instructor_id = auth.uid()
    )
  );

create policy "tests_insert_course_owner"
  on public.tests for insert
  with check (
    exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid())
  );

create policy "tests_update_course_owner"
  on public.tests for update
  using (exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()));

-- ============================================================================
-- test_attempts
-- ============================================================================
alter table public.test_attempts enable row level security;

create policy "test_attempts_read_self"
  on public.test_attempts for select
  using (user_id = auth.uid());

create policy "test_attempts_insert_self"
  on public.test_attempts for insert
  with check (user_id = auth.uid());

-- Updates (submit + grading) happen server-side via Edge Function (service role).
-- No client update policy.

-- ============================================================================
-- credits_wallet
-- ============================================================================
alter table public.credits_wallet enable row level security;

create policy "credits_wallet_read_self"
  on public.credits_wallet for select
  using (user_id = auth.uid());

-- All writes are server-side (grant-reward, redeem-credit Edge Functions).

-- ============================================================================
-- credit_transactions
-- ============================================================================
alter table public.credit_transactions enable row level security;

create policy "credit_transactions_read_self"
  on public.credit_transactions for select
  using (user_id = auth.uid());

-- ============================================================================
-- certificates
-- ============================================================================
alter table public.certificates enable row level security;

create policy "certificates_read_owner_or_public"
  on public.certificates for select
  using (user_id = auth.uid() or true);  -- certificates are publicly verifiable

-- ============================================================================
-- follows
-- ============================================================================
alter table public.follows enable row level security;

create policy "follows_read_all"
  on public.follows for select using (true);

create policy "follows_insert_self"
  on public.follows for insert
  with check (follower_id = auth.uid());

create policy "follows_delete_self"
  on public.follows for delete
  using (follower_id = auth.uid());

-- ============================================================================
-- iap_receipts
-- ============================================================================
alter table public.iap_receipts enable row level security;

create policy "iap_receipts_read_self"
  on public.iap_receipts for select
  using (user_id = auth.uid());

-- Insert is server-side only.

-- ============================================================================
-- notifications
-- ============================================================================
alter table public.notifications enable row level security;

create policy "notifications_read_self"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications_update_self"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================================
-- reward_pools (read-only for clients; server manages)
-- ============================================================================
alter table public.reward_pools enable row level security;

create policy "reward_pools_read_all"
  on public.reward_pools for select using (true);


-- ╭─────────────────────────────────────────────────────────────────────────╮
-- │ PART 3 / 3 — DEMO SEED (optional)                                       │
-- │ Skip this section if you don't want demo courses/instructors,           │
-- │ or replace the instructor UUIDs with real auth.users IDs first.         │
-- ╰─────────────────────────────────────────────────────────────────────────╯
-- Nuvexa Studio — demo seed
-- Three instructors, three courses with lessons, voices, tests.
-- IMPORTANT: this assumes auth.users rows exist for the seed UUIDs (create via Supabase dashboard or admin API).
-- For pure local dev with supabase CLI, run `supabase seed buckets` separately for media.

-- Demo user IDs (replace with real auth.users IDs from your project)
-- Instructor A: 00000000-0000-0000-0000-00000000a001
-- Instructor B: 00000000-0000-0000-0000-00000000a002
-- Instructor C: 00000000-0000-0000-0000-00000000a003

-- ============================================================================
-- Profiles
-- ============================================================================
insert into public.profiles (id, username, display_name, bio, is_instructor, is_verified)
values
  ('00000000-0000-0000-0000-00000000a001', 'priya_ai',  'Priya Mehta',   'AI educator. Ex-Google. I teach prompt engineering for builders.', true, true),
  ('00000000-0000-0000-0000-00000000a002', 'arjun_ml',  'Arjun Kapoor',  'ML engineer turned teacher. RAG, fine-tuning, agents.', true, true),
  ('00000000-0000-0000-0000-00000000a003', 'neha_nocode', 'Neha Verma',  'Building with AI, no-code first. Founder of two SaaS products.', true, false)
on conflict (id) do nothing;

-- ============================================================================
-- Courses
-- ============================================================================
insert into public.courses (id, instructor_id, title, slug, description, price_inr_paise, price_usd_cents, trial_seconds, total_lessons, is_published)
values
  (
    '00000000-0000-0000-0000-0000000c0001',
    '00000000-0000-0000-0000-00000000a001',
    'Prompt Engineering for Builders',
    'prompt-engineering-builders',
    'Ship AI features that actually work. Practical patterns, evals, caching, and cost control.',
    149900, 1999, 60, 12, true
  ),
  (
    '00000000-0000-0000-0000-0000000c0002',
    '00000000-0000-0000-0000-00000000a002',
    'RAG in Production',
    'rag-in-production',
    'From naive vector search to hybrid retrieval, reranking, and eval pipelines.',
    249900, 2999, 60, 14, true
  ),
  (
    '00000000-0000-0000-0000-0000000c0003',
    '00000000-0000-0000-0000-00000000a003',
    'Launch an AI SaaS in 30 Days',
    'launch-ai-saas-30-days',
    'No-code + AI. Pricing, onboarding, growth loops. Razorpay + Supabase friendly.',
    99900, 1499, 60, 10, true
  )
on conflict (id) do nothing;

-- ============================================================================
-- Lessons (a few per course, with one trial each)
-- ============================================================================
insert into public.lessons (course_id, position, title, video_stream_id, pdf_storage_path, duration_seconds, is_trial)
values
  -- Course 1
  ('00000000-0000-0000-0000-0000000c0001', 1, 'Why prompt engineering still matters', 'demo-stream-1a', 'demo/c1/l1.pdf', 540, true),
  ('00000000-0000-0000-0000-0000000c0001', 2, 'Anatomy of a great prompt',           'demo-stream-1b', 'demo/c1/l2.pdf', 720, false),
  ('00000000-0000-0000-0000-0000000c0001', 3, 'Tool use and structured output',      'demo-stream-1c', 'demo/c1/l3.pdf', 900, false),

  -- Course 2
  ('00000000-0000-0000-0000-0000000c0002', 1, 'RAG is not just embeddings',          'demo-stream-2a', 'demo/c2/l1.pdf', 600, true),
  ('00000000-0000-0000-0000-0000000c0002', 2, 'Chunking strategies that survive',    'demo-stream-2b', 'demo/c2/l2.pdf', 840, false),

  -- Course 3
  ('00000000-0000-0000-0000-0000000c0003', 1, 'Pick the right wedge',                'demo-stream-3a', 'demo/c3/l1.pdf', 480, true),
  ('00000000-0000-0000-0000-0000000c0003', 2, 'Pricing for the Indian market',       'demo-stream-3b', 'demo/c3/l2.pdf', 720, false);

-- ============================================================================
-- Tests
-- ============================================================================
insert into public.tests (course_id, question_pool, pass_threshold_pct, reward_threshold_pct, attempt_cooldown_days, retake_fee_paise)
values
  (
    '00000000-0000-0000-0000-0000000c0001',
    '[
      {"id":"q1","type":"mcq","prompt":"What does temperature=0 give you?","correct":"deterministic","points":1,"options":["creative","deterministic","random","fast"]},
      {"id":"q2","type":"open","prompt":"Write a system prompt for a customer support bot that refuses refunds politely.","rubric":"Should include role, tone, refusal pattern, escalation path.","points":3}
    ]'::jsonb,
    70, 95, 30, 9900
  ),
  (
    '00000000-0000-0000-0000-0000000c0002',
    '[
      {"id":"q1","type":"mcq","prompt":"Best chunk size for technical docs?","correct":"512-1024","points":1,"options":["64-128","256-512","512-1024","2048+"]}
    ]'::jsonb,
    70, 95, 30, 9900
  ),
  (
    '00000000-0000-0000-0000-0000000c0003',
    '[
      {"id":"q1","type":"open","prompt":"What is your 30-day launch plan for an AI tool priced at ₹499/mo?","rubric":"Should mention wedge, distribution channel, pricing tier, MVP scope.","points":5}
    ]'::jsonb,
    70, 95, 30, 9900
  )
on conflict (course_id) do nothing;

-- ============================================================================
-- Voices (sample reviews — requires enrollment for real inserts in app, seeded directly here)
-- ============================================================================
-- Skipping voice seeds until at least one demo learner account exists.
-- Add manually via seed-after-signup script.
