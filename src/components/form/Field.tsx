import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./form.module.css";

type Common = {
  name: string;
  label: string;
  error?: string;
  help?: string;
};

type InputProps = Common &
  Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & { multiline?: false };
type TextareaProps = Common &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> & {
    multiline: true;
  };

/**
 * A labelled input (design system §5): visible <label>, helper text, and the error under the
 * field, linked with aria-describedby so screen readers read it.
 */
export function Field(props: InputProps | TextareaProps) {
  const { name, label, error, help, multiline, ...rest } = props;
  const id = `f-${name}`;
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const shared = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: styles.input,
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {multiline ? (
        <textarea
          {...shared}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={`${styles.input} ${styles.textarea}`}
        />
      ) : (
        <input
          {...shared}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {help && (
        <p id={helpId} className={styles.help}>
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
