"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { SubmitButton } from "@/components/form/SubmitButton";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { closePost } from "./actions";
import styles from "./me.module.css";

/**
 * "Close post" with a confirmation step (design system §4: destructive actions ask first).
 * <details> opens the confirmation without any JavaScript.
 */
export function ClosePostButton({
  postId,
  title,
}: {
  postId: string;
  title: string;
}) {
  const [state, action] = useActionState(
    closePost.bind(null, postId),
    EMPTY_FORM_STATE,
  );

  if (state.tone === "success") {
    return <FormAlert message={state.message} tone="success" />;
  }

  return (
    <details className={styles.confirm}>
      <summary className="btn btn-secondary">Close post</summary>
      <form action={action} className={styles.confirmBox}>
        <FormAlert message={state.message} />
        <p>
          Close &ldquo;{title}&rdquo;? It will show as returned and nobody can
          claim it any more.
        </p>
        <SubmitButton pendingText="Closing…" variant="secondary">
          Yes, close it
        </SubmitButton>
      </form>
    </details>
  );
}
