"use server";

import { revalidatePath } from "next/cache";
import { requireApproved } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { fieldErrors, postSchema } from "@/lib/schemas";
import { friendlyError } from "@/lib/errors";
import { readFields, type FormState } from "@/lib/form-state";

const FIELDS = [
  "type",
  "category",
  "title",
  "description",
  "location",
  "happenedOn",
] as const;

/** F3: create a post. Status is always "pending" until an admin publishes it. */
export async function createPost(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Server check: only approved accounts (the SQL function checks again).
  await requireApproved();

  const values = readFields(formData, FIELDS);
  const parsed = postSchema.safeParse(values);
  if (!parsed.success) {
    return {
      message: "Check the fields below.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_post", {
    p_type: parsed.data.type,
    p_category: parsed.data.category,
    p_title: parsed.data.title,
    p_description: parsed.data.description,
    p_location: parsed.data.location,
    p_happened_on: parsed.data.happenedOn,
  });
  if (error) {
    return { message: friendlyError(error), values };
  }

  revalidatePath("/me");
  return {
    tone: "success",
    message: "Your post was sent. An admin will check it soon.",
  };
}
