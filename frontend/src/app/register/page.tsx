"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import PasswordField from "@/components/PasswordField";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-atmosphere">
      <div className="auth-orb right-[-7rem] top-[12%] h-72 w-72 bg-[rgba(126,200,196,0.16)]" />
      <div className="auth-orb bottom-[10%] left-[-8rem] h-84 w-84 bg-[rgba(196,165,116,0.14)]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <section className="animate-rise order-2 lg:order-1">
          <div className="lux-card relative overflow-hidden p-8 md:p-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--signal)]/45 to-transparent" />

            <p className="lux-label">Create access</p>
            <h2 className="lux-title mt-3 text-3xl md:text-4xl">Join the console</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Register to operate scanners, intel, and live monitoring.
            </p>

            <form onSubmit={handleRegister} className="mt-8 space-y-4">
              <label className="block space-y-2">
                <span className="text-xs tracking-[0.18em] text-white/40 uppercase">
                  Username
                </span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Choose a handle"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/30 focus:border-[var(--signal)]/50 focus:bg-black/55"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs tracking-[0.18em] text-white/40 uppercase">
                  Email
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@domain.com"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/30 focus:border-[var(--signal)]/50 focus:bg-black/55"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs tracking-[0.18em] text-white/40 uppercase">
                  Password
                </span>
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </label>

              {message && (
                <p className="rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
                  {message}
                </p>
              )}

              <button
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--signal)] px-4 py-3.5 text-sm font-semibold tracking-wide text-[#071312] transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create account"}
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-0.5"
                />
              </button>
            </form>

            <p className="mt-7 text-sm text-white/45">
              Already enrolled?{" "}
              <Link
                href="/login"
                className="text-[var(--signal)] underline-offset-4 transition hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="animate-rise-delay order-1 max-w-2xl lg:order-2 lg:justify-self-end">
          <p className="lux-label">EHD #47</p>
          <h1 className="lux-title mt-6 text-5xl leading-[1.05] md:text-7xl">
            Crafted for
            <span className="block text-[var(--signal)]">quiet precision.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted)] md:text-lg">
            One composition. One intent. A security workspace that feels
            considered, not crowded.
          </p>
          <div className="mt-10 flex items-center gap-6 text-xs uppercase tracking-[0.28em] text-white/35">
            <span>Operator ready</span>
            <span className="h-px w-10 bg-white/20" />
            <span>Local control</span>
          </div>
        </section>
      </div>
    </main>
  );
}
