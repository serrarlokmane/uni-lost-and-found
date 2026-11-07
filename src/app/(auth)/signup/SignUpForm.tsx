"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field } from "@/components/form/Field";
import { FormAlert } from "@/components/form/FormAlert";
import { SubmitButton } from "@/components/form/SubmitButton";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { LIMITS_CLIENT as L } from "@/lib/limits";
import { signUp } from "../actions";

export function SignUpForm() {
  const [state, action] = useActionState(signUp, EMPTY_FORM_STATE);
  const v = state.values ?? {};
  const e = state.errors ?? {};

  return (
    <form action={action} className="stack">
      <FormAlert message={state.message} />
      <Field
        name="fullName"
        label="Full name"
        autoComplete="name"
        required
        minLength={L.fullName.min}
        maxLength={L.fullName.max}
        defaultValue={v.fullName}
        error={e.fullName}
      />
      <Field
        name="studentId"
        label="Student ID"
        required
        minLength={L.studentId.min}
        maxLength={L.studentId.max}
        pattern="[A-Za-z0-9\-]{4,20}"
        placeholder="e.g. 2023-1042"
        defaultValue={v.studentId}
        error={e.studentId}
        help="Only admins see this. It is used to check you are a student."
      />
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        defaultValue={v.email}
        error={e.email}
      />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={L.password.min}
        maxLength={L.password.max}
        error={e.password}
        help={`At least ${L.password.min} characters.`}
      />
      <SubmitButton pendingText="Creating account…">
        Create account
      </SubmitButton>
      <p className="muted">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
