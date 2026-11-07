import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PostTag } from "@/components/PostTag";
import { requireApproved } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { formatDay, STATUS_LABEL } from "@/lib/format";
import { logOut } from "@/app/(auth)/actions";
import { ClosePostButton } from "./ClosePostButton";
import styles from "./me.module.css";

export const metadata: Metadata = { title: "My page · Lqito" };

type Props = { searchParams: Promise<{ tab?: string }> };

// F9: "My page" with my posts and my claims.
export default async function MePage({ searchParams }: Props) {
  const profile = await requireApproved();
  const tab = (await searchParams).tab === "claims" ? "claims" : "posts";
  const supabase = await createClient();

  return (
    <>
      <div className={styles.head}>
        <h1>My page</h1>
        <form action={logOut}>
          <button type="submit" className="btn btn-secondary">
            Log out
          </button>
        </form>
      </div>
      <p className="muted">
        Logged in as {profile.fullName} · student ID {profile.studentId}
      </p>

      <nav aria-label="My page sections" className={styles.tabs}>
        <Link
          href="/me"
          className={styles.tab}
          aria-current={tab === "posts" ? "page" : undefined}
        >
          My posts
        </Link>
        <Link
          href="/me?tab=claims"
          className={styles.tab}
          aria-current={tab === "claims" ? "page" : undefined}
        >
          My claims
        </Link>
      </nav>

      {tab === "posts" ? (
        <MyPosts supabase={supabase} />
      ) : (
        <MyClaims supabase={supabase} />
      )}
    </>
  );
}

type Client = Awaited<ReturnType<typeof createClient>>;

async function MyPosts({ supabase }: { supabase: Client }) {
  const { data: posts, error } = await supabase.rpc("my_posts");
  if (error) return <p role="alert">Could not load your posts.</p>;
  if (!posts.length) {
    return (
      <div className={styles.empty}>
        <p>You have no posts yet.</p>
        <Link href="/new" className="btn btn-primary">
          <Plus size={18} aria-hidden="true" />
          New post
        </Link>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.id} className={styles.item}>
          <PostTag post={post} showStatus />
          {post.status === "rejected" && post.reject_reason && (
            <p className={styles.reason}>
              Not published. Reason: {post.reject_reason}
            </p>
          )}
          {post.status === "resolved" && (
            <p className={styles.good}>
              Good news: this item was returned. If you still need to pick it
              up, go to the Lost &amp; Found office with your student card and
              say No. {post.ref}.
            </p>
          )}
          {post.status === "published" && (
            <ClosePostButton postId={post.id} title={post.title} />
          )}
        </li>
      ))}
    </ul>
  );
}

async function MyClaims({ supabase }: { supabase: Client }) {
  const { data: claims, error } = await supabase.rpc("my_claims");
  if (error) return <p role="alert">Could not load your claims.</p>;
  if (!claims.length) {
    return (
      <div className={styles.empty}>
        <p>
          You have no claims. Open a post and use &ldquo;This is mine&rdquo; or
          &ldquo;I found it&rdquo;.
        </p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {claims.map((claim) => (
        <li key={claim.id} className={`panel ${styles.claim}`}>
          <div className={styles.claimHead}>
            <Link href={`/posts/${claim.post_id}`} className={styles.claimLink}>
              No. {claim.post_ref}: {claim.post_title}
            </Link>
            <span
              className={`${styles.badge} ${
                claim.status === "accepted"
                  ? styles.badgeFound
                  : claim.status === "rejected"
                    ? styles.badgeLost
                    : ""
              }`}
            >
              {STATUS_LABEL[claim.status] ?? claim.status}
            </span>
          </div>
          <p className={styles.message}>{claim.message}</p>
          <p className="muted">Sent {formatDay(claim.created_at)}</p>
          {claim.status === "accepted" && (
            <p className={styles.good}>
              Good news: go to the Lost &amp; Found office with your student
              card and say No. {claim.post_ref}.
            </p>
          )}
          {claim.status === "rejected" && (
            <p className="muted">
              The admin chose another claim, or the post was closed.
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
