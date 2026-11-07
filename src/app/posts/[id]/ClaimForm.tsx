"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field } from "@/components/form/Field";
import { FormAlert } from "@/components/form/FormAlert";
import { SubmitButton } from "@/components/form/SubmitButton";
import { useFormKey } from "@/components/form/useFormKey";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { LIMITS_CLIENT as L } from "@/lib/limits";
import { createClaim } from "./actions";

/** F7: the claim form. "This is mine" on found posts, "I found it" on lost posts. */
export function ClaimForm({
  postId,
  postType,
}: {
  postId: string;
  postType: string;
}) {
  const [state, action] = useActionState(
    createClaim.bind(null, postId),
    EMPTY_FORM_STATE,
  );
  const formKey = useFormKey(state);
  const isFound = postType === "found";

  if (state.tone === "success") {
    return (
      <div className="stack">
        <FormAlert message={state.message} tone="success" />
        <Link href="/me?tab=claims">See my claims</Link>
      </div>
    );
  }

  return (
    <form action={action} className="stack" key={formKey}>
      <FormAlert message={state.message} />
      <Field
        name="message"
        label={
          isFound
            ? "Why is it yours?"
            : "Where did you find it, and where is it now?"
        }
        multiline
        required
        rows={4}
        minLength={L.claimMessage.min}
        maxLength={L.claimMessage.max}
        defaultValue={state.values?.message}
        error={state.errors?.message}
        help={
          isFound
            ? "Describe something only the owner would know (color, sticker, lock screen)."
            : "For example: found on a table near the window, I gave it to the office."
        }
      />
      <SubmitButton pendingText="Sending…">
        {isFound ? "This is mine" : "I found it"}
      </SubmitButton>
    </form>
  );
}
