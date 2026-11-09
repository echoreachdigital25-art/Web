import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="a-login">
      <div className="a-login-card">
        <p className="a-brand">KYNDE Motion</p>
        <h1>Studio dashboard</h1>
        <p className="a-muted">Sign in to manage projects and enquiries.</p>
        <LoginForm next={next} />
        <p className="a-muted a-small">
          No account? Administrator access is created by the site owner using the setup command described in the
          README. There is no public sign-up.
        </p>
      </div>
    </main>
  );
}
