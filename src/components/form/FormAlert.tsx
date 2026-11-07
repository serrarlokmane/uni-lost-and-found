"use client";

import { useEffect, useRef } from "react";
import styles from "./form.module.css";

/**
 * Summary at the top of a form. An error gets role="alert" and takes the focus, so keyboard and
 * screen reader users notice it (design system §5). A success uses role="status".
 */
export function FormAlert({
  message,
  tone = "error",
}: {
  message?: string;
  tone?: "error" | "success";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message && tone === "error") ref.current?.focus();
  }, [message, tone]);

  if (!message) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role={tone === "error" ? "alert" : "status"}
      className={tone === "error" ? styles.alertError : styles.alertSuccess}
    >
      {message}
    </div>
  );
}
