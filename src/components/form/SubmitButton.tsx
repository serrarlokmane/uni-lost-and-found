"use client";

import { useFormStatus } from "react-dom";

/** Shows "Publishing…" and is disabled while the form is sending (no double submit). */
export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  name,
  value,
}: {
  children: React.ReactNode;
  pendingText: string;
  variant?: "primary" | "secondary";
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={`btn btn-${variant}`}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? pendingText : children}
    </button>
  );
}
