import type { Database } from "@/lib/database.types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type LinkRow = Database["public"]["Tables"]["links"]["Row"];

export interface LinkStat {
  linkId: string;
  title: string;
  clicks: number;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD (UTC)
  views: number;
  clicks: number;
}

export interface AnalyticsSummary {
  views: number;
  clicks: number;
  ctr: number; // 0..1
  topLinks: LinkStat[];
  daily: DailyPoint[];
}

/** Click-through rate as a 0..1 ratio (0 when there are no views). */
export function clickThroughRate(views: number, clicks: number): number {
  if (views <= 0) return 0;
  return clicks / views;
}

export function formatCtr(views: number, clicks: number): string {
  return `${(clickThroughRate(views, clicks) * 100).toFixed(1)}%`;
}

/** Ordered list of the last `days` UTC dates (YYYY-MM-DD), inclusive of today. */
export function dailyBuckets(days: number, now: Date = new Date()): string[] {
  const out: string[] = [];
  const base = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  for (let i = days - 1; i >= 0; i--) {
    out.push(new Date(base - i * 86_400_000).toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Aggregate raw event rows into the figures rendered on the analytics
 * dashboard: totals, click-through rate, per-link clicks, and a daily series.
 */
export function summarize(
  events: EventRow[],
  links: LinkRow[],
  opts: { days?: number; now?: Date } = {},
): AnalyticsSummary {
  const days = opts.days ?? 30;
  const now = opts.now ?? new Date();

  let views = 0;
  let clicks = 0;
  const clicksByLink = new Map<string, number>();
  const dayMap = new Map<string, DailyPoint>();
  for (const date of dailyBuckets(days, now)) {
    dayMap.set(date, { date, views: 0, clicks: 0 });
  }

  for (const e of events) {
    const bucket = dayMap.get(e.created_at.slice(0, 10));
    if (e.type === "view") {
      views++;
      if (bucket) bucket.views++;
    } else if (e.type === "click") {
      clicks++;
      if (bucket) bucket.clicks++;
      if (e.link_id) {
        clicksByLink.set(e.link_id, (clicksByLink.get(e.link_id) ?? 0) + 1);
      }
    }
  }

  const titleById = new Map(links.map((l) => [l.id, l.title]));
  const topLinks: LinkStat[] = [...clicksByLink.entries()]
    .map(([linkId, c]) => ({
      linkId,
      title: titleById.get(linkId) ?? "(deleted link)",
      clicks: c,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return {
    views,
    clicks,
    ctr: clickThroughRate(views, clicks),
    topLinks,
    daily: [...dayMap.values()],
  };
}
