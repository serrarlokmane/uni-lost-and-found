import type { Metadata } from "next";
import { requireApproved } from "@/lib/auth";
import { NewPostForm } from "./NewPostForm";

export const metadata: Metadata = { title: "New post · Lqito" };

// F3: new post form. Visitors go to /login, pending/banned accounts to /pending.
export default async function NewPostPage() {
  await requireApproved();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="panel narrow">
      <h1>New post</h1>
      <p className="muted">
        An admin checks every post before it is public. You can post 5 times a
        day.
      </p>
      <NewPostForm today={today} />
    </section>
  );
}
