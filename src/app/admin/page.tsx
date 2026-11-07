import type { Metadata } from "next";
import Link from "next/link";
import { PostTag } from "@/components/PostTag";
import { getProfile, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { formatDay } from "@/lib/format";
import { reviewPost, reviewUser } from "./actions";
import { AdminButton, RejectWithReason } from "./AdminForm";
import styles from "./admin.module.css";

// Non-admins must not learn this page exists, so even the tab title is the 404 one.
export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const isAdmin = profile?.role === "admin" && profile.status === "approved";
  return { title: isAdmin ? "Admin · Lqito" : "Not found · Lqito" };
}

const TABS = ["accounts", "posts", "log"] as const;
type Tab = (typeof TABS)[number];
type Client = Awaited<ReturnType<typeof createClient>>;

type Props = { searchParams: Promise<{ tab?: string }> };

// F10: admin dashboard. Admin check #1 of 3: non-admins get the same 404 as a missing page.
export default async function AdminPage({ searchParams }: Props) {
  await requireAdmin();
  const asked = (await searchParams).tab;
  const tab: Tab = TABS.find((t) => t === asked) ?? "accounts";

  const supabase = await createClient();
  const { data: counts } = await supabase.rpc("admin_counts");
  const c = counts?.[0];

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "accounts", label: "Accounts", count: c?.pending_users },
    { id: "posts", label: "Posts", count: c?.pending_posts },
    { id: "log", label: "Log" },
  ];

  return (
    <>
      <h1>Admin</h1>
      <nav aria-label="Admin sections" className={styles.tabs}>
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin?tab=${t.id}`}
            className={styles.tab}
            aria-current={tab === t.id ? "page" : undefined}
          >
            {t.label}
            {t.count ? (
              <span className={styles.count}>
                {t.count}
                <span className="visually-hidden"> waiting</span>
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      {tab === "accounts" && <Accounts supabase={supabase} />}
      {tab === "posts" && <Posts supabase={supabase} />}
      {tab === "log" && <Log supabase={supabase} />}
    </>
  );
}

async function Accounts({ supabase }: { supabase: Client }) {
  const [pending, approved] = await Promise.all([
    supabase.rpc("admin_list_users", { p_status: "pending" }),
    supabase.rpc("admin_list_users", { p_status: "approved" }),
  ]);
  if (pending.error || approved.error) {
    return <p role="alert">Could not load accounts.</p>;
  }

  return (
    <>
      <section aria-labelledby="pending-title" className={styles.section}>
        <h2 id="pending-title">Waiting for approval</h2>
        {pending.data.length === 0 ? (
          <p className="muted">No accounts are waiting.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Student ID</th>
                <th scope="col">Email</th>
                <th scope="col">Signed up</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pending.data.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">{u.full_name}</td>
                  <td data-label="Student ID">
                    <strong>{u.student_id}</strong>
                  </td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Signed up">{formatDay(u.created_at)}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actions}>
                      <AdminButton
                        action={reviewUser.bind(null, u.id, "approved")}
                        label="Approve"
                        who={u.full_name}
                        pendingText="Approving…"
                      />
                      <AdminButton
                        action={reviewUser.bind(null, u.id, "rejected")}
                        label="Reject"
                        who={u.full_name}
                        pendingText="Rejecting…"
                        variant="secondary"
                        confirm={`Reject ${u.full_name}? They will not be able to post or claim.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="approved-title" className={styles.section}>
        <h2 id="approved-title">Approved students</h2>
        {approved.data.length === 0 ? (
          <p className="muted">No approved students yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Student ID</th>
                <th scope="col">Email</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {approved.data.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">{u.full_name}</td>
                  <td data-label="Student ID">{u.student_id}</td>
                  <td data-label="Email">{u.email}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actions}>
                      <AdminButton
                        action={reviewUser.bind(null, u.id, "banned")}
                        label="Ban"
                        who={u.full_name}
                        pendingText="Banning…"
                        variant="secondary"
                        confirm={`Ban ${u.full_name}? Their posts will be hidden and their pending claims rejected.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

async function Posts({ supabase }: { supabase: Client }) {
  const { data: posts, error } = await supabase.rpc("admin_list_posts", {
    p_status: "pending",
  });
  if (error) return <p role="alert">Could not load posts.</p>;
  if (!posts.length) {
    return <p className="muted">No posts are waiting.</p>;
  }

  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.id} className={`panel ${styles.review}`}>
          <PostTag post={post} />
          <p className={styles.description}>{post.description}</p>
          <p className="muted">
            By {post.owner_name} · sent {formatDay(post.created_at)}
          </p>
          {post.is_mine ? (
            <p className={styles.conflict}>
              This is your own post: another admin must review it.
            </p>
          ) : (
            <div className={styles.actions}>
              <AdminButton
                action={reviewPost.bind(null, post.id, "published")}
                label="Approve"
                who={post.title}
                pendingText="Publishing…"
              />
              <RejectWithReason
                action={reviewPost.bind(null, post.id, "rejected")}
                id={post.id}
                who={post.title}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

const ACTION_LABEL: Record<string, string> = {
  user_approved: "Approved account",
  user_rejected: "Rejected account",
  user_banned: "Banned account",
  post_published: "Published post",
  post_rejected: "Rejected post",
  claim_accepted: "Accepted claim",
  claim_rejected: "Rejected claim",
};

async function Log({ supabase }: { supabase: Client }) {
  const { data: rows, error } = await supabase.rpc("admin_list_log");
  if (error) return <p role="alert">Could not load the log.</p>;
  if (!rows.length) return <p className="muted">No decisions yet.</p>;

  return (
    <table className={styles.table}>
      <caption className="visually-hidden">Last 100 admin decisions</caption>
      <thead>
        <tr>
          <th scope="col">When</th>
          <th scope="col">Admin</th>
          <th scope="col">Decision</th>
          <th scope="col">Note</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td data-label="When">
              {formatDay(r.created_at)}{" "}
              {new Date(r.created_at).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Africa/Algiers",
              })}
            </td>
            <td data-label="Admin">{r.admin_name ?? "Deleted admin"}</td>
            <td data-label="Decision">{ACTION_LABEL[r.action] ?? r.action}</td>
            <td data-label={r.note ? "Note" : undefined}>{r.note ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
