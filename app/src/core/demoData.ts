// Demo data mirroring supabase/seed.sql. Used when isDemo=true.
import type { Course, Lesson, CreditsWallet } from "./models";

const NOW = new Date().toISOString();

export const DEMO_COURSES: Course[] = [
  {
    id: "demo-c1",
    instructor_id: "demo-i1",
    title: "Prompt Engineering for Builders",
    slug: "prompt-engineering-builders",
    description: "Ship AI features that actually work. Practical patterns, evals, caching, and cost control.",
    thumbnail_url: "asset:prompt-engineering-builders",
    price_inr_paise: 149900,
    price_usd_cents: 1999,
    trial_seconds: 60,
    total_lessons: 12,
    is_published: true,
    created_at: NOW,
  },
  {
    id: "demo-c2",
    instructor_id: "demo-i2",
    title: "RAG in Production",
    slug: "rag-in-production",
    description: "From naive vector search to hybrid retrieval, reranking, and eval pipelines.",
    thumbnail_url: "asset:rag-in-production",
    price_inr_paise: 249900,
    price_usd_cents: 2999,
    trial_seconds: 60,
    total_lessons: 14,
    is_published: true,
    created_at: NOW,
  },
  {
    id: "demo-c3",
    instructor_id: "demo-i3",
    title: "Launch an AI SaaS in 30 Days",
    slug: "launch-ai-saas-30-days",
    description: "No-code + AI. Pricing, onboarding, growth loops. Razorpay + Supabase friendly.",
    thumbnail_url: "asset:launch-ai-saas-30-days",
    price_inr_paise: 99900,
    price_usd_cents: 1499,
    trial_seconds: 60,
    total_lessons: 10,
    is_published: true,
    created_at: NOW,
  },
];

export const DEMO_LESSONS: Record<string, Lesson[]> = {
  "prompt-engineering-builders": [
    { id: "l1a", course_id: "demo-c1", position: 1, title: "Why prompt engineering still matters", video_stream_id: "demo", pdf_storage_path: null, duration_seconds: 540, is_trial: true },
    { id: "l1b", course_id: "demo-c1", position: 2, title: "Anatomy of a great prompt",            video_stream_id: "demo", pdf_storage_path: null, duration_seconds: 720, is_trial: false },
    { id: "l1c", course_id: "demo-c1", position: 3, title: "Tool use and structured output",       video_stream_id: "demo", pdf_storage_path: null, duration_seconds: 900, is_trial: false },
  ],
  "rag-in-production": [
    { id: "l2a", course_id: "demo-c2", position: 1, title: "RAG is not just embeddings",   video_stream_id: "demo", pdf_storage_path: null, duration_seconds: 600, is_trial: true },
    { id: "l2b", course_id: "demo-c2", position: 2, title: "Chunking strategies that survive", video_stream_id: "demo", pdf_storage_path: null, duration_seconds: 840, is_trial: false },
  ],
  "launch-ai-saas-30-days": [
    { id: "l3a", course_id: "demo-c3", position: 1, title: "Pick the right wedge",          video_stream_id: "demo", pdf_storage_path: null, duration_seconds: 480, is_trial: true },
    { id: "l3b", course_id: "demo-c3", position: 2, title: "Pricing for the Indian market", video_stream_id: "demo", pdf_storage_path: null, duration_seconds: 720, is_trial: false },
  ],
};

export const DEMO_WALLET: CreditsWallet = {
  user_id: "demo-user-id-00000000",
  balance_paise: 20000,           // ₹200 — already earned from a pass-tier reward
  lifetime_earned_paise: 20000,
  lifetime_spent_paise: 0,
};
