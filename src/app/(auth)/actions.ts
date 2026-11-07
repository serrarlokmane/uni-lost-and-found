"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { fieldErrors, loginSchema, signUpSchema } from "@/lib/schemas";
import { readFields, type FormState } from "@/lib/form-state";
import { GENERIC_ERROR } from "@/lib/errors";

/** F1: sign up. The trigger in SQL 1 creates the profile as student + pending. */
export async function signUp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = readFields(formData, [
    "fullName",
    "studentId",
    "email",
    "password",
  ]);
  const values = {
    fullName: raw.fullName,
    studentId: raw.studentId,
    email: raw.email,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: "Check the fields below.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Only these two fields are copied by the trigger. A "role" here would be ignored.
      data: {
        full_name: parsed.data.fullName,
        student_id: parsed.data.studentId,
      },
    },
  });

  if (error) {
    // Same message for "email used" and "student ID used": we don't confirm which one exists.
    const known =
      error.code === "user_already_exists" ||
      error.code === "email_exists" ||
      error.status === 500; // the trigger refused it (student ID already used)
    return {
      message: known
        ? "We couldn't create this account. The email or student ID may already be used. If it's yours, log in."
        : error.code === "weak_password"
          ? "Choose a stronger password."
          : GENERIC_ERROR,
      values,
    };
  }

  // "Confirm email" is off in v1, so the user is logged in now. A new account is always pending.
  redirect("/pending");
}

/** F1: log in, then go where the account status allows. */
export async function logIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = readFields(formData, ["email", "password"]);
  const values = { email: raw.email };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: "Check the fields below.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return {
      message:
        error?.status === 429
          ? "Too many tries. Wait a minute and try again."
          : "Wrong email or password.",
      values,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(profile?.status === "approved" ? "/" : "/pending");
}

/** F1: log out (a form button, so it works without JavaScript and can't be triggered by a link). */
export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
