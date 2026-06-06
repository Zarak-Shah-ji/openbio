"use client";

import { Download } from "lucide-react";
import { leadsToCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";

export function LeadsExport({
  leads,
}: {
  leads: { email: string; created_at: string }[];
}) {
  function download() {
    const blob = new Blob([leadsToCsv(leads)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openbio-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={download}
      disabled={leads.length === 0}
    >
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
