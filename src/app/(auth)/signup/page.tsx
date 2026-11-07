import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = { title: "Sign up · Lqito" };

export default async function SignUpPage() {
  if (await getProfile()) redirect("/");
  return (
    <section className="panel narrow">
      <h1>Create your account</h1>
      <p className="muted">
        An admin checks your student ID before you can post or claim items.
      </p>
      <SignUpForm />
    </section>
  );
}
