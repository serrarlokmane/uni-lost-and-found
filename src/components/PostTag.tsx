import Link from "next/link";
import { Calendar, Check, MapPin } from "lucide-react";
import { categoryLabel } from "@/lib/categories";
import { formatDay, STATUS_LABEL, TYPE_LABEL } from "@/lib/format";
import styles from "./PostTag.module.css";

export type PostTagData = {
  id: string;
  ref: number;
  type: string;
  category: string;
  title: string;
  location: string;
  happened_on: string;
  status: string;
};

/**
 * The post "tag" (design system §4), used on every list: a coloured stub with a punched hole,
 * the word Lost/Found and the reference number, then the details. The whole tag is one link.
 * showStatus: on My page and admin lists, a Pending/Rejected badge is shown too.
 */
export function PostTag({
  post,
  showStatus = false,
  href = `/posts/${post.id}`,
  as = "link",
}: {
  post: PostTagData;
  showStatus?: boolean;
  href?: string;
  as?: "link" | "heading";
}) {
  const resolved = post.status === "resolved";
  const typeClass = post.type === "found" ? styles.found : styles.lost;

  // The stub is aria-hidden, so screen readers get its words here, before the visible title.
  // (No aria-label on the link: its name must contain the visible text, WCAG 2.5.3.)
  const hiddenIntro = (
    <span className="visually-hidden">
      {TYPE_LABEL[post.type]}, number {post.ref}:{" "}
    </span>
  );

  const content = (
    <>
      <span className={`${styles.stub} ${typeClass}`} aria-hidden="true">
        <span className={styles.hole} />
        <span className={styles.typeWord}>{TYPE_LABEL[post.type]}</span>
        <span className={styles.ref}>No. {post.ref}</span>
      </span>
      <span className={styles.body}>
        {as !== "heading" && hiddenIntro}
        <span className={styles.badges}>
          <span className={styles.category}>
            {categoryLabel(post.category)}
          </span>
          {resolved && (
            <span className={`${styles.badge} ${styles.badgeFound}`}>
              <Check size={13} strokeWidth={3} aria-hidden="true" />
              Returned
            </span>
          )}
          {showStatus && !resolved && (
            <span
              className={`${styles.badge} ${
                post.status === "rejected"
                  ? styles.badgeLost
                  : post.status === "published"
                    ? styles.badgeFound
                    : styles.badgeMuted
              }`}
            >
              {STATUS_LABEL[post.status] ?? post.status}
            </span>
          )}
        </span>
        {as === "heading" ? (
          <h1 className={styles.title}>
            {hiddenIntro}
            {post.title}
          </h1>
        ) : (
          <span className={styles.title}>{post.title}</span>
        )}
        <span className={styles.meta}>
          <span className={styles.metaItem}>
            <MapPin size={15} aria-hidden="true" />
            {post.location}
          </span>
          <span className={styles.metaItem}>
            <Calendar size={15} aria-hidden="true" />
            <time dateTime={post.happened_on}>
              {formatDay(post.happened_on)}
            </time>
          </span>
        </span>
      </span>
    </>
  );

  if (as === "heading") {
    return <div className={`${styles.tag} ${styles.big}`}>{content}</div>;
  }
  return (
    <Link
      href={href}
      className={`${styles.tag} ${resolved ? styles.resolved : ""}`}
    >
      {content}
    </Link>
  );
}
