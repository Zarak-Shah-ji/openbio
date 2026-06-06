"use client";

import { useEffect } from "react";

/** Fires a single page-view event when a public profile page loads. */
export function ViewBeacon({ username }: { username: string }) {
  useEffect(() => {
    const body = JSON.stringify({ username });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track",
          new Blob([body], { type: "application/json" }),
        );
        return;
      }
    } catch {
      // fall through to fetch
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  }, [username]);

  return null;
}
