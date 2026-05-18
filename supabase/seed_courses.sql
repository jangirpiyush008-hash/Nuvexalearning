-- 5 demo courses + instructors. Run AFTER all_in_one.sql (schema + RLS).
-- Safe to re-run.

-- ============================================================================
-- Demo auth users (instructors)
-- Direct insert into auth.users — bypasses signup. Demo-only. Passwords are
-- unusable hashes; these accounts can't log in.
-- ============================================================================
insert into auth.users (
  instance_id, id, aud, role,
  email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token,
  email_change, email_change_token_new
)
values
  ('00000000-0000-0000-0000-000000000000',
   '00000000-0000-0000-0000-00000000a001',
   'authenticated', 'authenticated',
   'priya@nuvexa.demo', crypt('demo-instructor', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Priya Mehta"}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   '00000000-0000-0000-0000-00000000a002',
   'authenticated', 'authenticated',
   'arjun@nuvexa.demo', crypt('demo-instructor', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Arjun Kapoor"}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   '00000000-0000-0000-0000-00000000a003',
   'authenticated', 'authenticated',
   'neha@nuvexa.demo', crypt('demo-instructor', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Neha Verma"}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   '00000000-0000-0000-0000-00000000a004',
   'authenticated', 'authenticated',
   'ananya@nuvexa.demo', crypt('demo-instructor', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Ananya Iyer"}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   '00000000-0000-0000-0000-00000000a005',
   'authenticated', 'authenticated',
   'vikram@nuvexa.demo', crypt('demo-instructor', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Vikram Singh"}'::jsonb,
   now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- ============================================================================
-- Profiles for the instructors
-- ============================================================================
insert into public.profiles (id, username, display_name, bio, is_instructor, is_verified)
values
  ('00000000-0000-0000-0000-00000000a001', 'priya_ai',     'Priya Mehta',  'AI educator. Ex-Google. Prompt engineering for builders.', true, true),
  ('00000000-0000-0000-0000-00000000a002', 'arjun_ml',     'Arjun Kapoor', 'ML engineer turned teacher. RAG, agents, evals.', true, true),
  ('00000000-0000-0000-0000-00000000a003', 'neha_nocode',  'Neha Verma',   'Building with AI, no-code first. Founded two SaaS products.', true, false),
  ('00000000-0000-0000-0000-00000000a004', 'ananya_voice', 'Ananya Iyer',  'Voice + audio AI. Building Hindi LLM speech tools.', true, true),
  ('00000000-0000-0000-0000-00000000a005', 'vikram_llm',   'Vikram Singh', 'Fine-tuning, LoRA, Llama, Mistral. Ships weights.', true, true)
on conflict (id) do nothing;

-- ============================================================================
-- Courses (5 demo courses with themed thumbnails)
-- ============================================================================
insert into public.courses (id, instructor_id, title, slug, description, thumbnail_url, price_inr_paise, price_usd_cents, trial_seconds, total_lessons, is_published)
values
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-00000000a001',
   'Prompt Engineering for Builders', 'prompt-engineering-builders',
   'Ship AI features that actually work. Patterns, evals, caching, cost control.',
   'asset:prompt-engineering-builders', 149900, 1999, 60, 12, true),
  ('00000000-0000-0000-0000-0000000c0002', '00000000-0000-0000-0000-00000000a002',
   'RAG in Production', 'rag-in-production',
   'From naive vector search to hybrid retrieval, reranking, and eval pipelines.',
   'asset:rag-in-production', 249900, 2999, 60, 14, true),
  ('00000000-0000-0000-0000-0000000c0003', '00000000-0000-0000-0000-00000000a003',
   'Launch an AI SaaS in 30 Days', 'launch-ai-saas-30-days',
   'No-code + AI. Pricing, onboarding, growth loops. Razorpay + Supabase friendly.',
   'asset:launch-ai-saas-30-days', 99900, 1499, 60, 10, true),
  ('00000000-0000-0000-0000-0000000c0004', '00000000-0000-0000-0000-00000000a004',
   'Voice & Audio with AI', 'voice-and-audio-with-ai',
   'Whisper, ElevenLabs, real-time STT/TTS pipelines. Ship a voice-first app.',
   'asset:voice-and-audio-with-ai', 179900, 2199, 60, 11, true),
  ('00000000-0000-0000-0000-0000000c0005', '00000000-0000-0000-0000-00000000a005',
   'Fine-tuning Llama 3.3', 'fine-tuning-llama',
   'LoRA, QLoRA, dataset prep, eval, deploy your own weights.',
   'asset:fine-tuning-llama', 299900, 3499, 60, 16, true)
on conflict (id) do nothing;

-- ============================================================================
-- A few lessons per course (one trial each)
-- ============================================================================
insert into public.lessons (course_id, position, title, video_stream_id, pdf_storage_path, duration_seconds, is_trial)
values
  ('00000000-0000-0000-0000-0000000c0001', 1, 'Why prompt engineering still matters', 'demo-1a', 'demo/c1/l1.pdf', 540, true),
  ('00000000-0000-0000-0000-0000000c0001', 2, 'Anatomy of a great prompt',            'demo-1b', 'demo/c1/l2.pdf', 720, false),
  ('00000000-0000-0000-0000-0000000c0001', 3, 'Tool use + structured output',          'demo-1c', 'demo/c1/l3.pdf', 900, false),

  ('00000000-0000-0000-0000-0000000c0002', 1, 'RAG is not just embeddings',           'demo-2a', 'demo/c2/l1.pdf', 600, true),
  ('00000000-0000-0000-0000-0000000c0002', 2, 'Chunking strategies that survive',     'demo-2b', 'demo/c2/l2.pdf', 840, false),

  ('00000000-0000-0000-0000-0000000c0003', 1, 'Pick the right wedge',                 'demo-3a', 'demo/c3/l1.pdf', 480, true),
  ('00000000-0000-0000-0000-0000000c0003', 2, 'Pricing for the Indian market',        'demo-3b', 'demo/c3/l2.pdf', 720, false),

  ('00000000-0000-0000-0000-0000000c0004', 1, 'Whisper + real-time STT primer',       'demo-4a', 'demo/c4/l1.pdf', 540, true),
  ('00000000-0000-0000-0000-0000000c0004', 2, 'ElevenLabs voice cloning ethics',      'demo-4b', 'demo/c4/l2.pdf', 720, false),

  ('00000000-0000-0000-0000-0000000c0005', 1, 'When to fine-tune (and when not to)', 'demo-5a', 'demo/c5/l1.pdf', 600, true),
  ('00000000-0000-0000-0000-0000000c0005', 2, 'LoRA in 20 lines of code',             'demo-5b', 'demo/c5/l2.pdf', 900, false)
on conflict (course_id, position) do nothing;

-- ============================================================================
-- Tests (basic question pool per course)
-- ============================================================================
insert into public.tests (course_id, question_pool, pass_threshold_pct, reward_threshold_pct, attempt_cooldown_days, retake_fee_paise)
values
  ('00000000-0000-0000-0000-0000000c0001',
   '[{"id":"q1","type":"mcq","prompt":"What does temperature=0 give you?","correct":"deterministic","points":1,"options":["creative","deterministic","random","fast"]}]'::jsonb,
   70, 95, 30, 9900),
  ('00000000-0000-0000-0000-0000000c0002',
   '[{"id":"q1","type":"mcq","prompt":"Best chunk size for technical docs?","correct":"512-1024","points":1,"options":["64-128","256-512","512-1024","2048+"]}]'::jsonb,
   70, 95, 30, 9900),
  ('00000000-0000-0000-0000-0000000c0003',
   '[{"id":"q1","type":"open","prompt":"30-day launch plan for an AI tool at ₹499/mo?","rubric":"Wedge, channel, pricing tier, MVP scope.","points":5}]'::jsonb,
   70, 95, 30, 9900),
  ('00000000-0000-0000-0000-0000000c0004',
   '[{"id":"q1","type":"mcq","prompt":"Real-time STT latency target (ms)?","correct":"200-500","points":1,"options":["<100","200-500","800-1200","2000+"]}]'::jsonb,
   70, 95, 30, 9900),
  ('00000000-0000-0000-0000-0000000c0005',
   '[{"id":"q1","type":"mcq","prompt":"LoRA targets which layers usually?","correct":"attention q/v projections","points":1,"options":["embedding","attention q/v projections","layer norm","output head"]}]'::jsonb,
   70, 95, 30, 9900)
on conflict (course_id) do nothing;
