"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { reasonSchema, uuidSchema } from "@/lib/schemas";
import { friendlyError } from "@/lib/errors";
import type { FormState } from "@/lib/form-state";

// Admin check #2 of 3: every action checks the role itself (check #1 is the page, #3 the SQL).

const userDecision = z.enum(["approved", "rejected", "banned"]);
const postDecision = z.enum(["published", "rejected"]);

const INVALID: FormState = { message: friendlyError({ message: "not_found" }) };

/** F2: approve, reject or ban an account. */
export async function reviewUser(
  userId: string,
  decision: string,
  _prev: FormState,
): Promise<FormState> {
  await requireAdmin();
  const id = uuidSchema.safeParse(userId);
  const d = userDecision.safeParse(decision);
  if (!id.success || !d.success) return INVALID;

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_user", {
    p_user_id: id.data,
    p_decision: d.data,
  });
  if (error) return { message: friendlyError(error) };

  revalidatePath("/admin");
  return { tone: "success", message: "Done." };
}

/** F4: publish a pending post, or reject it with a reason. */
export async function reviewPost(
  postId: string,
  decision: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = uuidSchema.safeParse(postId);
  const d = postDecision.safeParse(decision);
  if (!id.success || !d.success) return INVALID;

  let reason: string | undefined;
  if (d.data === "rejected") {
    const r = reasonSchema.safeParse(formData.get("reason") ?? "");
    if (!r.success) {
      return {
        message: "Write a reason for the student.",
        errors: { reason: r.error.issues[0]?.message ?? "Required." },
      };
    }
    reason = r.data;
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_post", {
    p_post_id: id.data,
    p_decision: d.data,
    p_reason: reason,
  });
  if (error) return { message: friendlyError(error) };

  revalidatePath("/admin");
  revalidatePath("/");
  return { tone: "success", message: "Done." };
}
