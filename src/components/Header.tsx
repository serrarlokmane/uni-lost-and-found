import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "./Header.module.css";

// v1 skeleton: "My page" and "Admin" links come with F1 and F2.
// prefetch={false} on links to pages that don't exist yet, so the skeleton logs no 404s.
export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path className={styles.logo} d="M3 6.5 8.5 2H21v20H8.5L3 17.5z" />
            <circle className={styles.logoHole} cx="8" cy="12" r="1.8" />
          </svg>
          Lqito
        </Link>
        <nav aria-label="Main" className={styles.nav}>
          <Link href="/login" prefetch={false} className="btn btn-text">
            Log in
          </Link>
          <Link href="/new" prefetch={false} className="btn btn-primary">
            <Plus size={18} aria-hidden="true" />
            New post
          </Link>
        </nav>
      </div>
    </header>
  );
}
