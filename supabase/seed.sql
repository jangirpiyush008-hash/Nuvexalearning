-- Nuvexa Studio — demo seed
-- Three instructors, three courses with lessons, voices, tests.
-- Creates auth.users rows first so profile FKs are satisfied.

-- ============================================================================
-- Demo auth users (instructors)
-- Direct insert into auth.users — bypasses normal signup flow. Demo-only.
-- The passwords are bcrypt hashes of an unusable value; these accounts are
-- not meant to log in. They exist solely to satisfy profile FK constraints.
-- ============================================================================
insert into auth.users (
  id, instance_id, aud, role,
  email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values
  ('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'priya@nuvexa.demo', crypt('nuvexa-demo-instructor', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Priya Mehta"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-00000000a002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'arjun@nuvexa.demo', crypt('nuvexa-demo-instructor', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Arjun Kapoor"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-00000000a003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'neha@nuvexa.demo', crypt('nuvexa-demo-instructor', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Neha Verma"}'::jsonb, now(), now())
on conflict (id) do nothing;

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
  ('00000000-0000-0000-0000-0000000c0003', 2, 'Pricing for the Indian market',       'demo-stream-3b', 'demo/c3/l2.pdf', 720, false)
on conflict (course_id, position) do nothing;

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
