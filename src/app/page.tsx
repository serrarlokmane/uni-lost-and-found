import Link from "next/link";
import { Plus } from "lucide-react";
import { PostTag } from "@/components/PostTag";
import { SearchForm } from "@/components/SearchForm";
import { createClient } from "@/lib/supabase";
import { searchParamsSchema } from "@/lib/schemas";
import styles from "./home.module.css";

type Props = { searchParams: Promise<Record<string, string | string[]>> };

// F5: home page. Published and resolved posts, newest first, through search_posts (SQL 2).
export default async function HomePage({ searchParams }: Props) {
  const filters = searchParamsSchema.parse(await searchParams);
  const hasFilters = Boolean(filters.q || filters.type || filters.category);

  const supabase = await createClient();
  // Parameters only: the keyword never becomes part of a SQL or PostgREST filter string.
  const { data: posts, error } = await supabase.rpc("search_posts", {
    p_query: filters.q,
    p_type: filters.type,
    p_category: filters.category,
  });

  return (
    <>
      <h1>Lost something on campus?</h1>
      <SearchForm filters={filters} />

      <section aria-labelledby="results-title">
        <h2 id="results-title" className="visually-hidden">
          Posts
        </h2>
        {error ? (
          <p role="alert" className={styles.state}>
            Could not load posts. Try again in a minute.
          </p>
        ) : !posts?.length ? (
          hasFilters ? (
            <div className={styles.state}>
              <p>
                {filters.q
                  ? `No posts match '${filters.q}'. Try fewer words or check the spelling.`
                  : "No posts match these filters."}
              </p>
              <Link href="/">Clear search</Link>
            </div>
          ) : (
            <div className={styles.state}>
              <p>No posts yet. Lost something? Create the first post.</p>
              <Link href="/new" className="btn btn-primary">
                <Plus size={18} aria-hidden="true" />
                New post
              </Link>
            </div>
          )
        ) : (
          <ul className={styles.list}>
            {posts.map((post) => (
              <li key={post.id}>
                <PostTag post={post} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
