"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import PasswordField from "@/components/PasswordField";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-atmosphere">
      <div className="auth-orb left-[-8rem] top-[18%] h-72 w-72 bg-[rgba(196,165,116,0.18)]" />
      <div className="auth-orb bottom-[8%] right-[-6rem] h-80 w-80 bg-[rgba(126,200,196,0.14)]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <section className="animate-rise max-w-2xl">
          <p className="lux-label">EHD #47</p>
          <h1 className="lux-title mt-6 text-5xl leading-[1.05] md:text-7xl">
            Enter the
            <span className="block text-[var(--accent-strong)]">security atelier.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted)] md:text-lg">
            A refined operations console for ethical hacking. Calm surfaces,
            precise signals, decisive action.
          </p>
          <div className="mt-10 flex items-center gap-6 text-xs uppercase tracking-[0.28em] text-white/35">
            <span>Encrypted session</span>
            <span className="h-px w-10 bg-white/20" />
            <span>Live telemetry</span>
          </div>
        </section>

        <section className="animate-rise-delay">
          <div className="lux-card relative overflow-hidden p-8 md:p-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />

            <p className="lux-label">Sign in</p>
            <h2 className="lux-title mt-3 text-3xl md:text-4xl">Welcome back</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Access your ethical hacking dashboard.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <label className="block space-y-2">
                <span className="text-xs tracking-[0.18em] text-white/40 uppercase">
                  Username
                </span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Operator name"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:bg-black/55"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs tracking-[0.18em] text-white/40 uppercase">
                  Password
                </span>
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  placeholder="Your passphrase"
                />
              </label>

              {message && (
                <p className="rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
                  {message}
                </p>
              )}

              <button
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold tracking-wide text-[#1a140c] transition hover:bg-[var(--accent-strong)] disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Enter console"}
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-0.5"
                />
              </button>
            </form>

            <p className="mt-7 text-sm text-white/45">
              New here?{" "}
              <Link
                href="/register"
                className="text-[var(--accent-strong)] underline-offset-4 transition hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
