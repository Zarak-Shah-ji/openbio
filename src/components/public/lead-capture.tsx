"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonStyleProps, type Theme } from "@/lib/theme";

type Status = "idle" | "loading" | "done" | "error";

export function LeadCapture({
  username,
  theme,
}: {
  username: string;
  theme: Theme;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.rpc("capture_lead", {
      p_username: username,
      p_email: email,
    });
    if (error) {
      setStatus("error");
    } else {
      setStatus("done");
      setEmail("");
    }
  }

  if (status === "done") {
    return (
      <p className="text-center text-sm opacity-90">Thanks for subscribing! 🎉</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="min-w-0 flex-1 rounded-lg border border-current/30 bg-white/10 px-3 py-2 text-sm outline-none placeholder:opacity-60"
        style={{ color: theme.textColor }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 px-4 py-2 text-sm font-medium disabled:opacity-60"
        style={buttonStyleProps(theme)}
      >
        {status === "loading" ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
