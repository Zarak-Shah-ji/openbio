import { describe, it, expect } from "vitest";
import {
  clickThroughRate,
  dailyBuckets,
  formatCtr,
  summarize,
  type EventRow,
  type LinkRow,
} from "@/lib/analytics";

describe("clickThroughRate", () => {
  it("is 0 when there are no views", () => {
    expect(clickThroughRate(0, 5)).toBe(0);
  });
  it("is clicks / views otherwise", () => {
    expect(clickThroughRate(10, 5)).toBe(0.5);
  });
});

describe("formatCtr", () => {
  it("formats a percentage", () => {
    expect(formatCtr(10, 5)).toBe("50.0%");
  });
  it("handles zero views", () => {
    expect(formatCtr(0, 0)).toBe("0.0%");
  });
});

describe("dailyBuckets", () => {
  it("returns n consecutive UTC dates ending today", () => {
    expect(dailyBuckets(3, new Date("2026-06-06T10:00:00Z"))).toEqual([
      "2026-06-04",
      "2026-06-05",
      "2026-06-06",
    ]);
  });
});

const now = new Date("2026-06-06T10:00:00Z");
const links: LinkRow[] = [
  {
    id: "l1",
    user_id: "u",
    title: "Link 1",
    url: "https://a",
    position: 0,
    is_active: true,
    is_featured: false,
    thumbnail_url: null,
    visible_from: null,
    visible_until: null,
    created_at: "2026-01-01T00:00:00Z",
  },
];

function ev(partial: Partial<EventRow>): EventRow {
  return {
    id: "e",
    user_id: "u",
    link_id: null,
    type: "view",
    referrer: null,
    user_agent: null,
    created_at: "2026-06-06T09:00:00Z",
    ...partial,
  };
}

describe("summarize", () => {
  it("aggregates totals, ctr, top links and a daily series", () => {
    const events = [
      ev({ type: "view" }),
      ev({ type: "view" }),
      ev({ type: "click", link_id: "l1" }),
    ];
    const s = summarize(events, links, { days: 7, now });

    expect(s.views).toBe(2);
    expect(s.clicks).toBe(1);
    expect(s.ctr).toBeCloseTo(0.5);
    expect(s.topLinks).toEqual([{ linkId: "l1", title: "Link 1", clicks: 1 }]);
    expect(s.daily).toHaveLength(7);
    expect(s.daily.find((d) => d.date === "2026-06-06")).toEqual({
      date: "2026-06-06",
      views: 2,
      clicks: 1,
    });
  });

  it("labels clicks on deleted links", () => {
    const s = summarize([ev({ type: "click", link_id: "gone" })], links, {
      days: 1,
      now,
    });
    expect(s.topLinks[0]).toEqual({
      linkId: "gone",
      title: "(deleted link)",
      clicks: 1,
    });
  });
});
