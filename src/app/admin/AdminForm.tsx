"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { SubmitButton } from "@/components/form/SubmitButton";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/form-state";
import formStyles from "@/components/form/form.module.css";
import styles from "./admin.module.css";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/** One button that runs one admin action, with its own error/success message. */
export function AdminButton({
  action,
  label,
  pendingText,
  variant = "primary",
  confirm,
  who,
}: {
  action: Action;
  label: string;
  /** Who or what the button acts on, read by screen readers: "Approve Nora Lahlou". */
  who: string;
  pendingText: string;
  variant?: "primary" | "secondary";
  /** For destructive actions (ban): asks first, with <details>. */
  confirm?: string;
}) {
  const [state, act] = useActionState(action, EMPTY_FORM_STATE);

  const form = (
    <form action={act} className={styles.inlineForm}>
      <SubmitButton pendingText={pendingText} variant={variant}>
        {confirm ? `Yes, ${label.toLowerCase()}` : label}
        <span className="visually-hidden"> {who}</span>
      </SubmitButton>
      <FormAlert message={state.message} tone={state.tone} />
    </form>
  );

  if (!confirm) return form;
  return (
    <details className={styles.confirm}>
      <summary className={`btn btn-${variant}`}>
        {label}
        <span className="visually-hidden"> {who}</span>
      </summary>
      <div className={styles.confirmBox}>
        <p>{confirm}</p>
        {form}
      </div>
    </details>
  );
}

/** "Reject" with a required reason (design system §4: Reject asks for a reason). */
export function RejectWithReason({
  action,
  id,
  who,
}: {
  action: Action;
  id: string;
  who: string;
}) {
  const [state, act] = useActionState(action, EMPTY_FORM_STATE);
  const error = state.errors?.reason;
  const inputId = `reason-${id}`;

  return (
    <details className={styles.confirm} open={Boolean(error) || undefined}>
      <summary className="btn btn-secondary">
        Reject<span className="visually-hidden"> {who}</span>
      </summary>
      <form action={act} className={styles.confirmBox}>
        <label htmlFor={inputId} className={formStyles.label}>
          Reason (the student sees it)
        </label>
        <input
          id={inputId}
          name="reason"
          required
          minLength={3}
          maxLength={200}
          className={formStyles.input}
          placeholder="e.g. Please add the place where you found it"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && (
          <p id={`${inputId}-error`} className={formStyles.error}>
            {error}
          </p>
        )}
        <SubmitButton pendingText="Rejecting…" variant="secondary">
          Reject post
        </SubmitButton>
        <FormAlert
          message={error ? undefined : state.message}
          tone={state.tone}
        />
      </form>
    </details>
  );
}
