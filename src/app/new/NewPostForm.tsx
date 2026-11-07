"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field } from "@/components/form/Field";
import { FormAlert } from "@/components/form/FormAlert";
import { SubmitButton } from "@/components/form/SubmitButton";
import { useFormKey } from "@/components/form/useFormKey";
import { CATEGORIES } from "@/lib/categories";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { LIMITS_CLIENT as L } from "@/lib/limits";
import { createPost } from "./actions";
import styles from "./new.module.css";
import formStyles from "@/components/form/form.module.css";

export function NewPostForm({ today }: { today: string }) {
  const [state, action] = useActionState(createPost, EMPTY_FORM_STATE);
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const formKey = useFormKey(state);

  return (
    // A new key after each reply: the form is rebuilt with the values the server sent back
    // (or empty after a success).
    <form action={action} className="stack" key={formKey}>
      <FormAlert message={state.message} tone={state.tone} />
      {state.tone === "success" && (
        <p>
          <Link href="/me">See it on My page</Link>
        </p>
      )}

      <fieldset
        className={styles.typeGroup}
        aria-describedby={e.type ? "f-type-error" : undefined}
      >
        <legend className={formStyles.label}>Did you lose or find it?</legend>
        <div className={styles.typeChoices}>
          <label className={`${styles.typeCard} ${styles.lost}`}>
            <input
              type="radio"
              name="type"
              value="lost"
              required
              defaultChecked={v.type === "lost"}
            />
            <span className={styles.hole} aria-hidden="true" />
            <span className={styles.typeWord}>Lost</span>
            <span className={styles.typeHelp}>I lost something</span>
          </label>
          <label className={`${styles.typeCard} ${styles.found}`}>
            <input
              type="radio"
              name="type"
              value="found"
              defaultChecked={v.type === "found"}
            />
            <span className={styles.hole} aria-hidden="true" />
            <span className={styles.typeWord}>Found</span>
            <span className={styles.typeHelp}>I found something</span>
          </label>
        </div>
        {e.type && (
          <p id="f-type-error" className={formStyles.error}>
            {e.type}
          </p>
        )}
      </fieldset>

      <div className={formStyles.field}>
        <label htmlFor="f-category" className={formStyles.label}>
          Category
        </label>
        <select
          id="f-category"
          name="category"
          required
          className={formStyles.input}
          defaultValue={v.category ?? ""}
          aria-invalid={e.category ? true : undefined}
          aria-describedby={e.category ? "f-category-error" : undefined}
        >
          <option value="" disabled>
            Choose a category
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {e.category && (
          <p id="f-category-error" className={formStyles.error}>
            {e.category}
          </p>
        )}
      </div>

      <Field
        name="title"
        label="Title"
        required
        minLength={L.title.min}
        maxLength={L.title.max}
        placeholder="e.g. White earbuds case"
        defaultValue={v.title}
        error={e.title}
      />
      <Field
        name="description"
        label="Description"
        multiline
        required
        minLength={L.description.min}
        maxLength={L.description.max}
        rows={5}
        defaultValue={v.description}
        error={e.description}
        help="Describe the item, but keep one detail secret: the owner will use it to prove it's theirs."
      />
      <Field
        name="location"
        label="Place"
        required
        minLength={L.location.min}
        maxLength={L.location.max}
        placeholder="e.g. Library, 2nd floor"
        defaultValue={v.location}
        error={e.location}
      />
      <Field
        name="happenedOn"
        label="Date"
        type="date"
        required
        max={today}
        defaultValue={v.happenedOn ?? today}
        error={e.happenedOn}
        help="The day you lost or found it."
      />

      <p className="muted">
        Don&apos;t write your phone number or email. Hand-over happens at the
        Lost &amp; Found office.
      </p>
      <SubmitButton pendingText="Publishing…">Publish post</SubmitButton>
    </form>
  );
}
