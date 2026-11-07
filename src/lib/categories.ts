// Shared by client and server components, so it must not import zod or server files
// (PLAN.md pitfall #4). Same list as the CHECK constraint in supabase/migrations.

export const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "keys", label: "Keys" },
  { value: "bags", label: "Bags" },
  { value: "clothing", label: "Clothing" },
  { value: "documents", label: "Documents" },
  { value: "other", label: "Other" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as [
  Category,
  ...Category[],
];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "Other";
}

export const POST_TYPES = ["lost", "found"] as const;
export type PostType = (typeof POST_TYPES)[number];
