"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";
import { Bot, Send, UserCircle } from "lucide-react";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function AICopilotPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Ask me about phishing, SSL issues, SQL injection, high-risk URLs, malware, or quarantine.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function askCopilot() {
    if (!question.trim()) return;

    const userQuestion = question;

    setMessages((previous) => [
      ...previous,
      { role: "user", text: userQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ai-copilot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        { role: "ai", text: data.answer || "I could not generate an answer." },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        { role: "ai", text: "AI Copilot is unavailable right now." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020711] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Security Assistant
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              AI Copilot
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Ask cybersecurity questions and get simple explanations.
            </p>

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <div className="max-h-[560px] space-y-5 overflow-y-auto pr-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "ai" && (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                        <Bot size={18} />
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] rounded-2xl border p-4 text-sm leading-6 ${
                        message.role === "user"
                          ? "border-blue-400/20 bg-blue-500/10 text-blue-100"
                          : "border-cyan-400/10 bg-black/40 text-slate-200"
                      }`}
                    >
                      {message.text}
                    </div>

                    {message.role === "user" && (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                        <UserCircle size={18} />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="mt-1 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300">
                      <Bot size={18} />
                    </div>

                    <div className="rounded-2xl border border-cyan-400/10 bg-black/40 p-4 text-sm text-slate-400">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      askCopilot();
                    }
                  }}
                  placeholder="Ask: What is phishing?"
                  className="flex-1 rounded-xl border border-cyan-400/10 bg-black/45 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />

                <button
                  onClick={askCopilot}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-cyan-300 transition hover:border-cyan-300/50 disabled:opacity-50"
                >
                  <Send size={17} />
                  Ask
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}