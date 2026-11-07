import Link from "next/link";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { LIMITS_CLIENT } from "@/lib/limits";
import styles from "./SearchForm.module.css";

type Filters = { q?: string; type?: string; category?: string };

/** Builds "/?q=..&type=.." keeping the other filters. URLSearchParams escapes every value. */
function hrefWith(filters: Filters, change: Partial<Filters>): string {
  const params = new URLSearchParams();
  const next = { ...filters, ...change };
  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

/**
 * Search bar + filters (design system §4). A plain GET form: works without JavaScript, the
 * filters sit in the URL and the back button works. The type chips are links.
 */
export function SearchForm({ filters }: { filters: Filters }) {
  const chips = [
    { label: "All", value: undefined },
    { label: "Lost", value: "lost" },
    { label: "Found", value: "found" },
  ];

  return (
    <div className={styles.wrap}>
      <form action="/" method="get" role="search" className={styles.form}>
        <label htmlFor="q" className={styles.label}>
          Search posts
        </label>
        <div className={styles.row}>
          <input
            id="q"
            name="q"
            type="search"
            className={styles.input}
            defaultValue={filters.q}
            maxLength={LIMITS_CLIENT.query.max}
            placeholder="earbuds, keys, blue bag"
          />
          {filters.type && (
            <input type="hidden" name="type" value={filters.type} />
          )}
          <label htmlFor="category" className="visually-hidden">
            Category
          </label>
          <select
            id="category"
            name="category"
            className={styles.select}
            defaultValue={filters.category ?? ""}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <button type="submit" className={`btn btn-primary ${styles.submit}`}>
            <Search size={20} aria-hidden="true" />
            <span className="visually-hidden">Search</span>
          </button>
        </div>
      </form>

      <nav aria-label="Lost or found" className={styles.chips}>
        {chips.map((chip) => {
          const active = (filters.type ?? undefined) === chip.value;
          return (
            <Link
              key={chip.label}
              href={hrefWith(filters, { type: chip.value })}
              className={`${styles.chip} ${active ? styles.chipActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {chip.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
