import Link from "next/link";
import styles from "./not-found.module.css";

// One 404 for everything: a missing post, a pending post, /admin for a non-admin (design §6).
// It looks like an empty tag with the number 404.
export default function NotFound() {
  return (
    <section className={styles.wrap}>
      <div className={styles.tag} aria-hidden="true">
        <span className={styles.hole} />
        <span className={styles.no}>No. 404</span>
      </div>
      <h1>We couldn&apos;t find this page.</h1>
      <p className="muted">
        The post may have been removed, or the link is wrong.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to all posts
      </Link>
    </section>
  );
}
