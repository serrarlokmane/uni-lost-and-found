// Small display helpers, safe for server and client components.

/** "2026-11-06" -> "6 Nov". Dates from the DB are plain days, so we format them in UTC. */
export function formatDay(value: string): string {
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  published: "Published",
  rejected: "Rejected",
  resolved: "Returned",
  accepted: "Accepted",
};

export const TYPE_LABEL: Record<string, string> = {
  lost: "Lost",
  found: "Found",
};
