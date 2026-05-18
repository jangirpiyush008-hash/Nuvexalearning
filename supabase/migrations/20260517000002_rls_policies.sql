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
