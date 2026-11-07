"use server";

import { revalidatePath } from "next/cache";
import { requireApproved } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { uuidSchema } from "@/lib/schemas";
import { friendlyError } from "@/lib/errors";
import type { FormState } from "@/lib/form-state";

/** F9: the owner closes their own published post (it becomes "resolved"). */
export async function closePost(
  postId: string,
  _prev: FormState,
): Promise<FormState> {
  await requireApproved();
  if (!uuidSchema.safeParse(postId).success) {
    return { message: friendlyError({ message: "not_found" }) };
  }

  const supabase = await createClient();
  // The SQL function checks that the caller owns the post and that it is published.
  const { error } = await supabase.rpc("close_post", { p_post_id: postId });
  if (error) return { message: friendlyError(error) };

  revalidatePath("/me");
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  return { tone: "success", message: "Post closed. Thanks for telling us!" };
}
