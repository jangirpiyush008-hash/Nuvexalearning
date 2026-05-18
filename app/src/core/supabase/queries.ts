import { supabase } from "./client";
import type { Course, Lesson, Voice, CreditsWallet, Profile } from "../models";

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Profile | null;
}

export async function createMyProfile(input: {
  id: string;
  username: string;
  display_name: string;
  phone?: string | null;
}): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: input.id,
      username: input.username,
      display_name: input.display_name,
      phone: input.phone ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchPublishedCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Course[];
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Course | null;
}

export async function fetchLessonsForCourse(courseId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Lesson[];
}

export async function fetchVoicesForCourse(courseId: string, cursor?: string): Promise<Voice[]> {
  let q = supabase
    .from("voices")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_public", true)
    .is("parent_voice_id", null)
    .order("created_at", { ascending: false })
    .limit(20);
  if (cursor) q = q.lt("created_at", cursor);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Voice[];
}

export async function fetchMyWallet(userId: string): Promise<CreditsWallet | null> {
  const { data, error } = await supabase
    .from("credits_wallet")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as CreditsWallet | null;
}
