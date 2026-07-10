"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, UserPlus } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
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
        error instanceof Error
          ? error.message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-green-500/20 bg-[#0b1220] p-8 shadow-2xl shadow-green-500/10">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-green-500/10 p-3">
              <Shield className="text-green-400" size={32} />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-green-400">
                EHD #47
              </p>
              <h1 className="text-3xl font-bold">Create Account</h1>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Register to access the ethical hacking dashboard.
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-5">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="w-full rounded-xl border border-green-500/20 bg-black px-4 py-3 text-sm outline-none focus:border-green-400"
            />

            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              className="w-full rounded-xl border border-green-500/20 bg-black px-4 py-3 text-sm outline-none focus:border-green-400"
            />

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-xl border border-green-500/20 bg-black px-4 py-3 text-sm outline-none focus:border-green-400"
            />

            {message && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {message}
              </p>
            )}

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-bold text-black transition hover:bg-green-400 disabled:opacity-50"
            >
              <UserPlus size={18} />
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <button
            onClick={() => router.push("/login")}
            className="mt-5 w-full text-sm text-gray-400 hover:text-green-400"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </main>
  );
}