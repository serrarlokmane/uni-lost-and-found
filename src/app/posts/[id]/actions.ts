"use server";

import { revalidatePath } from "next/cache";
import { requireApproved } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { claimSchema, fieldErrors } from "@/lib/schemas";
import { friendlyError } from "@/lib/errors";
import { readFields, type FormState } from "@/lib/form-state";

/** F7: "This is mine" / "I found it". The SQL function checks every business rule again. */
export async function createClaim(
  postId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireApproved();

  const { message } = readFields(formData, ["message"]);
  const parsed = claimSchema.safeParse({ postId, message });
  if (!parsed.success) {
    return {
      message: "Check the message below.",
      errors: fieldErrors(parsed.error),
      values: { message },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_claim", {
    p_post_id: parsed.data.postId,
    p_message: parsed.data.message,
  });
  if (error) return { message: friendlyError(error), values: { message } };

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/me");
  return {
    tone: "success",
    message:
      "Your claim was sent. An admin will check it and you'll see the answer on My page.",
  };
}
