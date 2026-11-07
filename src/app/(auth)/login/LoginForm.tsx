"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field } from "@/components/form/Field";
import { FormAlert } from "@/components/form/FormAlert";
import { SubmitButton } from "@/components/form/SubmitButton";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { LIMITS_CLIENT as L } from "@/lib/limits";
import { logIn } from "../actions";

export function LoginForm() {
  const [state, action] = useActionState(logIn, EMPTY_FORM_STATE);
  const e = state.errors ?? {};

  return (
    <form action={action} className="stack">
      <FormAlert message={state.message} />
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        defaultValue={state.values?.email}
        error={e.email}
      />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={L.password.max}
        error={e.password}
      />
      <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
      <p className="muted">
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </form>
  );
}
