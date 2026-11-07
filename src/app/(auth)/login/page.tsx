import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in · Lqito" };

export default async function LoginPage() {
  if (await getProfile()) redirect("/");
  return (
    <section className="panel narrow">
      <h1>Log in</h1>
      <LoginForm />
    </section>
  );
}
