// Field length limits for HTML attributes in client components (no zod here: pitfall #4).
// src/lib/schemas.ts re-uses these numbers, so the browser and the server always agree.
export const LIMITS_CLIENT = {
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
