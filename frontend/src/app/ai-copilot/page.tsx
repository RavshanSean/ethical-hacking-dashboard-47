"use client";

import { apiFetch } from "@/lib/api";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Bot, Send, UserCircle, Volume2 } from "lucide-react";

type Message = { role: "user" | "ai"; text: string };

export default function AICopilotPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Ask me about phishing, SSL issues, SQL injection, high-risk URLs, malware, quarantine, recent events, URL scans, vulnerability scans, or ThreatIntel.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [lastAnswer, setLastAnswer] = useState("");

  async function sendQuestion(userQuestion: string) {
    const cleanQuestion = userQuestion.trim();
    if (!cleanQuestion || loading) return;

    setMessages((previous) => [...previous, { role: "user", text: cleanQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await apiFetch(`/ai-copilot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion }),
      });

      if (!response.ok) throw new Error("AI Copilot request failed");

      const data = await response.json();
      const aiAnswer = data.answer || "I could not generate an answer.";

      setLastAnswer(aiAnswer);
      setMessages((previous) => [...previous, { role: "ai", text: aiAnswer }]);
    } catch (error) {
      console.error("AI Copilot request failed:", error);
      const errorAnswer = "AI Copilot is unavailable right now.";
      setLastAnswer(errorAnswer);
      setMessages((previous) => [...previous, { role: "ai", text: errorAnswer }]);
    } finally {
      setLoading(false);
    }
  }

  function speakLastAnswer() {
    if (!lastAnswer || typeof window === "undefined") return;

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(lastAnswer);
    speech.rate = 0.95;
    speech.pitch = 1;
    speech.volume = 1;
    speech.onstart = () => setSpeaking(true);
    speech.onend = () => setSpeaking(false);
    speech.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(speech);
  }

  const quickPrompts = [
    "Give me dashboard summary",
    "Give me threat intel summary",
    "Explain latest URL scan",
    "Explain latest file scan",
    "Explain latest vulnerability scan",
  ];

  return (
    <div className="app-shell">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <section className="mx-auto max-w-6xl">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Security Assistant</p>
            <h1 className="mt-3 text-4xl font-bold">AI Copilot</h1>
            <p className="mt-2 text-sm text-slate-400">Ask cybersecurity questions and get explanations grounded in your dashboard data.</p>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
              <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6 shadow-[0_0_40px_rgba(34,211,238,0.05)]">
                <div className="flex flex-col items-center text-center">
                  <AIOrb loading={loading} speaking={speaking} />
                  <p className="mt-6 text-xs uppercase tracking-[0.35em] text-cyan-300">EHD AI Analyst</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{loading ? "Analyzing..." : "Ready"}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">Database-aware assistant for scans, threats, vulnerabilities, security events, quarantine, and ThreatIntel.</p>
                  <button onClick={speakLastAnswer} disabled={!lastAnswer} className="mt-6 flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 transition hover:border-cyan-300/50 disabled:opacity-40"><Volume2 size={17} />Speak Last Answer</button>
                  <p className="mt-3 text-xs text-slate-500">Voice output only. No microphone permission needed.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-4 sm:p-6">
                <div className="max-h-[560px] space-y-5 overflow-y-auto pr-2">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      {message.role === "ai" && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300 sm:h-12 sm:w-12"><Bot size={18} /></div>}
                      <div className={`max-w-[82%] rounded-2xl border p-4 text-sm leading-6 sm:max-w-[75%] ${message.role === "user" ? "border-blue-400/20 bg-blue-500/10 text-blue-100" : "border-cyan-400/10 bg-black/40 text-slate-200"}`}>{message.text}</div>
                      {message.role === "user" && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300 sm:h-12 sm:w-12"><UserCircle size={18} /></div>}
                    </div>
                  ))}
                  {loading && <div className="flex gap-3"><div className="mt-1 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300"><Bot size={18} /></div><div className="rounded-2xl border border-cyan-400/10 bg-black/40 p-4 text-sm text-slate-400">Thinking...</div></div>}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => <button key={prompt} onClick={() => sendQuestion(prompt)} disabled={loading} className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50">{prompt}</button>)}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendQuestion(question); }} placeholder="Ask: Give me dashboard summary" className="flex-1 rounded-xl border border-cyan-400/10 bg-black/45 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
                  <button onClick={() => sendQuestion(question)} disabled={loading || !question.trim()} className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-cyan-300 transition hover:border-cyan-300/50 disabled:opacity-50"><Send size={17} />Ask</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function AIOrb({ loading, speaking }: { loading: boolean; speaking: boolean }) {
  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
      <div className={`absolute h-48 w-48 rounded-full border border-cyan-300/20 sm:h-64 sm:w-64 ${loading ? "animate-spin" : "animate-pulse"}`} style={{ animationDuration: "18s" }} />
      <div className={`absolute h-56 w-56 rounded-full border border-cyan-200/10 sm:h-72 sm:w-72 ${loading ? "animate-spin" : "animate-pulse"}`} style={{ animationDuration: "28s", animationDirection: "reverse" }} />
      <div className="absolute h-44 w-44 animate-pulse rounded-full border border-cyan-300/15 sm:h-56 sm:w-56" />
      <div className={`absolute h-[166px] w-[166px] rounded-full border border-blue-300/80 shadow-[0_0_10px_rgba(59,130,246,0.9),0_0_20px_rgba(59,130,246,0.6)] sm:h-[210px] sm:w-[210px] ${loading ? "animate-[orbTalk_0.8s_ease-in-out_infinite]" : speaking ? "animate-[orbTalk_0.45s_ease-in-out_infinite]" : "animate-[orbBreathe_3s_ease-in-out_infinite]"}`} />
      <div className={`relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full sm:h-52 sm:w-52 ${loading ? "animate-[orbTalk_0.8s_ease-in-out_infinite]" : speaking ? "animate-[orbTalk_0.45s_ease-in-out_infinite]" : "animate-[orbBreathe_3s_ease-in-out_infinite]"}`}>
        <div className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.95),rgba(186,230,253,0.9)_18%,rgba(56,189,248,0.8)_36%,rgba(37,99,235,0.9)_70%,rgba(14,116,144,0.8)_100%)] ${loading ? "animate-pulse" : ""}`} />
        <div className="absolute -left-10 top-8 h-28 w-64 rotate-[-12deg] animate-pulse rounded-full bg-white/80 blur-2xl" />
        <div className="absolute left-0 top-20 h-28 w-64 rotate-[15deg] animate-pulse rounded-full bg-cyan-500/55 blur-2xl" />
        <div className="absolute -bottom-8 right-0 h-36 w-48 animate-pulse rounded-full bg-blue-800/70 blur-2xl" />
        <div className={`absolute h-56 w-56 rounded-full bg-[conic-gradient(from_180deg,rgba(255,255,255,0.25),rgba(34,211,238,0.05),rgba(37,99,235,0.3),rgba(255,255,255,0.2))] blur-xl ${loading ? "animate-spin" : "animate-pulse"}`} />
        <div className="absolute inset-0 rounded-full shadow-[inset_0_-25px_45px_rgba(29,78,216,0.55),inset_0_20px_40px_rgba(255,255,255,0.25),0_0_55px_rgba(34,211,238,0.35)]" />
        <div className={`absolute inset-[-18px] rounded-full border border-cyan-200/15 ${loading ? "animate-ping" : "animate-pulse"}`} />
      </div>
      <style jsx>{`
        @keyframes orbBreathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.045); } }
        @keyframes orbTalk { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.08); } 50% { transform: scale(0.97); } 75% { transform: scale(1.06); } }
      `}</style>
    </div>
  );
}