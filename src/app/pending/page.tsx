import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { logOut } from "@/app/(auth)/actions";

export const metadata: Metadata = { title: "Account status · Lqito" };

// Shown to pending, rejected and banned accounts. They can only read this and log out.
const TEXT = {
  pending: {
    title: "Waiting for approval",
    body: "Your account is waiting for approval. An admin checks student IDs every day.",
  },
  rejected: {
    title: "Account not approved",
    body: "Your account was not approved. Go to the Lost & Found office with your student card.",
  },
  banned: {
    title: "Account blocked",
    body: "Your account is blocked. Contact the Lost & Found office.",
  },
} as const;

export default async function PendingPage() {
  const profile = await requireUser();
  if (profile.status === "approved") redirect("/");
  const text = TEXT[profile.status];

  return (
    <section className="panel narrow stack">
      <h1>{text.title}</h1>
      <p>{text.body}</p>
      <form action={logOut}>
        <button type="submit" className="btn btn-secondary">
          Log out
        </button>
      </form>
    </section>
  );
}
