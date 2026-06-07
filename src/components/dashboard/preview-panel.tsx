"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Wraps the phone preview so it's sticky beside the editor on desktop and a
 * collapsible panel on mobile (where it would otherwise be hidden).
 */
export function PreviewPanel({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="hidden lg:block">
        <div className="sticky top-8">{children}</div>
      </div>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-lg border-2 border-foreground bg-card px-4 py-2.5 text-sm font-semibold shadow-hard-sm"
        >
          {open ? "Hide preview" : "Show preview"}
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
        {open && <div className="mt-4 flex justify-center">{children}</div>}
      </div>
    </div>
  );
}
