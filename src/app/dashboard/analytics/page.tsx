import { redirect } from "next/navigation";
import { Eye, Mail, MousePointerClick, Percent } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCtr, summarize } from "@/lib/analytics";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { LeadsExport } from "@/components/dashboard/leads-export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WINDOW_DAYS = 30;

export default async function AnalyticsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const supabase = await createClient();
  // Request-time window boundary. This is a Server Component that runs per
  // request, so reading the clock here is intentional and safe.
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();

  const [eventsRes, linksRes, leadsRes] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("user_id", profile.id)
      .gte("created_at", since),
    supabase.from("links").select("*").eq("user_id", profile.id),
    supabase
      .from("leads")
      .select("email, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const summary = summarize(eventsRes.data ?? [], linksRes.data ?? [], {
    days: WINDOW_DAYS,
  });
  const leads = leadsRes.data ?? [];

  const stats = [
    { label: "Views", value: summary.views, icon: Eye },
    { label: "Clicks", value: summary.clicks, icon: MousePointerClick },
    {
      label: "Click-through rate",
      value: formatCtr(summary.views, summary.clicks),
      icon: Percent,
    },
    { label: "Leads", value: leads.length, icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Last {WINDOW_DAYS} days — the insights other tools charge for.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Views &amp; clicks over time</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsChart data={summary.daily} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top links</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clicks yet.</p>
            ) : (
              <ul className="space-y-2">
                {summary.topLinks.slice(0, 8).map((l) => (
                  <li
                    key={l.linkId}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate">{l.title}</span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {l.clicks}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Leads</CardTitle>
            <LeadsExport leads={leads} />
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No leads captured yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {leads.slice(0, 8).map((lead, i) => (
                  <li
                    key={`${lead.email}-${i}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate">{lead.email}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
