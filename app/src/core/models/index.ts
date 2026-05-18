// Typed models — mirror the Supabase schema. Keep in sync with migrations.

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  link?: string | null;
  is_instructor: boolean;
  is_verified: boolean;
  is_public: boolean;
  created_at: string;
};

export type Course = {
  id: string;
  instructor_id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  price_inr_paise: number;
  price_usd_cents: number;
  trial_seconds: number;
  total_lessons: number;
  is_published: boolean;
  created_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  position: number;
  title: string;
  video_stream_id?: string | null;
  pdf_storage_path?: string | null;
  duration_seconds: number;
  is_trial: boolean;
};

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string;
  completion_pct: number;
  last_lesson_id?: string | null;
  completed_at?: string | null;
};

export type Voice = {
  id: string;
  user_id: string;
  course_id: string;
  rating?: number | null;
  text: string;
  screenshot_url?: string | null;
  outcome_tags: string[];
  is_public: boolean;
  helpful_count: number;
  parent_voice_id?: string | null;
  created_at: string;
};

export type CreditsWallet = {
  user_id: string;
  balance_paise: number;
  lifetime_earned_paise: number;
  lifetime_spent_paise: number;
};
