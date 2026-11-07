import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";

export type Profile = {
  id: string;
  fullName: string;
  studentId: string;
  role: "student" | "admin";
  status: "pending" | "approved" | "rejected" | "banned";
};

/**
 * The logged-in user's profile, or null for a visitor.
 * getUser() asks Supabase Auth to check the session (it doesn't just trust the cookie).
 * The role comes ONLY from public.profiles, never from user_metadata (PLAN.md pitfall #9).
 * cache(): called many times in one request (header, page, actions), it hits the DB once.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, student_id, role, status")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;

  // The CHECK constraints allow only these values; anything else falls back to the safest one.
  const statuses = ["pending", "approved", "rejected", "banned"] as const;
  const status = statuses.find((s) => s === data.status) ?? "pending";

  return {
    id: data.id,
    fullName: data.full_name,
    studentId: data.student_id,
    role: data.role === "admin" ? "admin" : "student",
    status,
  };
});

/** For pages and actions that need a logged-in user (any status). Visitors go to /login. */
export async function requireUser(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** For pages and actions that need an APPROVED account. Others go to /pending. */
export async function requireApproved(): Promise<Profile> {
  const profile = await requireUser();
  if (profile.status !== "approved") redirect("/pending");
  return profile;
}

/**
 * For admin pages and admin actions: check 1 (page) and 2 (Server Action) of 3; the SQL function
 * is check 3. Non-admins get the same 404 as a missing page, so /admin leaks nothing.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin" || profile.status !== "approved") {
    notFound();
  }
  return profile;
}
