import Link from "next/link";
import { Plus, Shield } from "lucide-react";
import { getProfile } from "@/lib/auth";
import styles from "./Header.module.css";

// Header (design system §4): logo · "Log in" or "My page" · "Admin" (admins only) · "New post".
// Hiding the Admin link is NOT the security: /admin checks the role on the server itself.
export async function Header() {
  const profile = await getProfile();
  const isAdmin = profile?.role === "admin" && profile.status === "approved";

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
          {isAdmin && (
            <Link href="/admin" className="btn btn-text" aria-label="Admin">
              <Shield size={18} aria-hidden="true" />
              <span className={styles.hideOnSmall}>Admin</span>
            </Link>
          )}
          {profile ? (
            <Link href="/me" className="btn btn-text">
              My page
            </Link>
          ) : (
            <Link href="/login" className="btn btn-text">
              Log in
            </Link>
          )}
          <Link href="/new" className="btn btn-primary">
            <Plus size={18} aria-hidden="true" />
            {/* With 3 links (admins), the text hides on small phones; the name stays "New post". */}
            <span className={isAdmin ? styles.hideOnSmallText : undefined}>
              New post
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
