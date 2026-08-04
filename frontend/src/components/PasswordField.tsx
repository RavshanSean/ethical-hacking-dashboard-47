"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  name?: string;
  id?: string;
  className?: string;
};

export default function PasswordField({
  value,
  onChange,
  placeholder = "Password",
  autoComplete = "current-password",
  name = "password",
  id = "password",
  className = "",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className="peer w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:bg-black/55"
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/45 transition hover:bg-white/5 hover:text-white"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
