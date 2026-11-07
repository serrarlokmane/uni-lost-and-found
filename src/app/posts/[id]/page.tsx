import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostTag } from "@/components/PostTag";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { uuidSchema } from "@/lib/schemas";
import { formatDay } from "@/lib/format";
import { ClosePostButton } from "@/app/me/ClosePostButton";
import { ClaimForm } from "./ClaimForm";
import styles from "./post.module.css";

type Props = { params: Promise<{ id: string }> };

/**
 * Loads one post through get_post (SQL 1). Public posts for everyone; pending/rejected ones only
 * for the owner or an admin. Anything else, including a bad id, is the same 404 (design §6).
 */
async function loadPost(id: string) {
  if (!uuidSchema.safeParse(id).success) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_post", { p_post_id: id });
  return data?.[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await loadPost((await params).id);
  return { title: post ? `${post.title} · Lqito` : "Not found · Lqito" };
}

// F6: post details page.
export default async function PostPage({ params }: Props) {
  const post = await loadPost((await params).id);
  if (!post) notFound();

  const profile = await getProfile();
  const isPublic = post.status === "published" || post.status === "resolved";

  return (
    <article className="stack">
      <PostTag post={post} as="heading" showStatus={!isPublic} />

      {post.is_mine && post.status === "pending" && (
        <p role="status" className={styles.note}>
          Only you can see this post. An admin will check it soon.
        </p>
      )}
      {post.status === "rejected" && post.reject_reason && (
        <p className={styles.noteError}>
          Not published. Reason: {post.reject_reason}
        </p>
      )}

      <section className="panel" aria-labelledby="desc-title">
        <h2 id="desc-title">Description</h2>
        <p className={styles.description}>{post.description}</p>
        <p className="muted">Posted {formatDay(post.created_at)}</p>
      </section>

      {post.status === "published" && (
        <section className="panel stack" aria-labelledby="claim-title">
          <h2 id="claim-title">
            {post.is_mine
              ? "Your post"
              : post.type === "found"
                ? "Is this yours?"
                : "Did you find it?"}
          </h2>
          <ActionBox
            postId={post.id}
            postType={post.type}
            postTitle={post.title}
            isMine={post.is_mine}
            status={profile?.status}
          />
        </section>
      )}

      {post.status === "resolved" && (
        <p className={styles.note}>
          This item was returned to its owner through the Lost &amp; Found
          office.
        </p>
      )}

      <p>
        <Link href="/">Back to all posts</Link>
      </p>
    </article>
  );
}

/** What the bottom box shows, by who is looking (PROJECT.md §5, §8). */
async function ActionBox({
  postId,
  postType,
  postTitle,
  isMine,
  status,
}: {
  postId: string;
  postType: string;
  postTitle: string;
  isMine: boolean;
  status?: string;
}) {
  if (!status) {
    return (
      <p>
        <Link href="/login">Log in</Link> to send a claim. An admin checks every
        claim, and the item is handed over at the Lost &amp; Found office.
      </p>
    );
  }
  if (status !== "approved") {
    return <p>Your account must be approved before you can send a claim.</p>;
  }
  if (isMine) {
    return (
      <>
        <p>Found it yourself, or got it back? Close the post.</p>
        <ClosePostButton postId={postId} title={postTitle} />
      </>
    );
  }

  const supabase = await createClient();
  const { data: myClaim } = await supabase.rpc("my_claim_status", {
    p_post_id: postId,
  });
  if (myClaim) {
    return (
      <p>
        You already sent a claim for this post (
        {myClaim === "pending" ? "waiting for the admin" : myClaim}).{" "}
        <Link href="/me?tab=claims">See my claims</Link>
      </p>
    );
  }
  return <ClaimForm postId={postId} postType={postType} />;
}
