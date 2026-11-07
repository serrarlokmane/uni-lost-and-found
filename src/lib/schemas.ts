import { z } from "zod";
import { CATEGORY_VALUES, POST_TYPES } from "@/lib/categories";

// Server-side validation for every form. The same limits are in the HTML attributes (to help the
// user) and in the SQL CHECK constraints (the last lock). Keep the three in sync.
export const LIMITS = {
  fullName: { min: 2, max: 80 },
  studentId: { min: 4, max: 20 },
  password: { min: 8, max: 72 },
  title: { min: 3, max: 80 },
  description: { min: 10, max: 1000 },
  location: { min: 2, max: 80 },
  claimMessage: { min: 10, max: 1000 },
  reason: { min: 3, max: 200 },
  query: { max: 100 },
} as const;

const trimmed = (min: number, max: number, what: string) =>
  z
    .string()
    .trim()
    .min(min, `${what} needs at least ${min} characters.`)
    .max(max, `${what} can have at most ${max} characters.`);

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "This email is too long.")
  .pipe(z.email("Enter a valid email address."));

export const signUpSchema = z.object({
  fullName: trimmed(LIMITS.fullName.min, LIMITS.fullName.max, "Full name"),
  studentId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9-]{4,20}$/,
      "Use 4 to 20 letters, digits or dashes (as on your student card).",
    ),
  email,
  password: z
    .string()
    .min(
      LIMITS.password.min,
      `Password needs at least ${LIMITS.password.min} characters.`,
    )
    .max(LIMITS.password.max, "Password is too long."),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(LIMITS.password.max),
});

/** "YYYY-MM-DD" from an <input type="date">, not in the future, at most a year ago. */
const happenedOn = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    const todayUtc = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    // +1 day of tolerance for time zones (the database checks the exact rule).
    return (
      date.getTime() <= todayUtc + 86_400_000 &&
      date.getTime() >= todayUtc - oneYear
    );
  }, "The date can't be in the future or more than a year ago.");

export const postSchema = z.object({
  type: z.enum(POST_TYPES, "Choose Lost or Found."),
  category: z.enum(CATEGORY_VALUES, "Choose a category."),
  title: trimmed(LIMITS.title.min, LIMITS.title.max, "Title"),
  description: trimmed(
    LIMITS.description.min,
    LIMITS.description.max,
    "Description",
  ),
  location: trimmed(LIMITS.location.min, LIMITS.location.max, "Place"),
  happenedOn,
});

export const claimSchema = z.object({
  postId: z.uuid("This post does not exist."),
  message: trimmed(
    LIMITS.claimMessage.min,
    LIMITS.claimMessage.max,
    "Your message",
  ),
});

export const uuidSchema = z.uuid();

export const reasonSchema = trimmed(
  LIMITS.reason.min,
  LIMITS.reason.max,
  "The reason",
);

/** Home page GET params. Anything unknown becomes "no filter" instead of an error. */
export const searchParamsSchema = z.object({
  q: z
    .string()
    .trim()
    .max(LIMITS.query.max)
    .optional()
    .catch(undefined)
    .transform((v) => (v ? v : undefined)),
  type: z.enum(POST_TYPES).optional().catch(undefined),
  category: z.enum(CATEGORY_VALUES).optional().catch(undefined),
});

/** Field errors as { field: "first message" }, for showing under each input. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
