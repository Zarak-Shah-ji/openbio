import { describe, it, expect } from "vitest";
import {
  isLinkVisible,
  isValidHttpUrl,
  normalizeUrl,
  visibleLinks,
  type LinkRow,
} from "@/lib/links";

function link(partial: Partial<LinkRow>): LinkRow {
  return {
    id: "1",
    user_id: "u",
    title: "t",
    url: "https://x.com",
    position: 0,
    is_active: true,
    is_featured: false,
    thumbnail_url: null,
    visible_from: null,
    visible_until: null,
    created_at: "2026-01-01T00:00:00Z",
    ...partial,
  };
}

const now = new Date("2026-06-06T12:00:00Z");

describe("isLinkVisible", () => {
  it("is hidden when inactive", () => {
    expect(isLinkVisible(link({ is_active: false }), now)).toBe(false);
  });
  it("is visible when active with no schedule", () => {
    expect(isLinkVisible(link({}), now)).toBe(true);
  });
  it("is hidden before visible_from", () => {
    expect(
      isLinkVisible(link({ visible_from: "2026-06-07T00:00:00Z" }), now),
    ).toBe(false);
  });
  it("is visible after visible_from", () => {
    expect(
      isLinkVisible(link({ visible_from: "2026-06-05T00:00:00Z" }), now),
    ).toBe(true);
  });
  it("is hidden after visible_until", () => {
    expect(
      isLinkVisible(link({ visible_until: "2026-06-05T00:00:00Z" }), now),
    ).toBe(false);
  });
  it("is visible inside the window", () => {
    expect(
      isLinkVisible(
        link({
          visible_from: "2026-06-01T00:00:00Z",
          visible_until: "2026-06-10T00:00:00Z",
        }),
        now,
      ),
    ).toBe(true);
  });
});

describe("visibleLinks", () => {
  it("filters hidden links and sorts by position", () => {
    const links = [
      link({ id: "a", position: 2 }),
      link({ id: "b", position: 0, is_active: false }),
      link({ id: "c", position: 1 }),
    ];
    expect(visibleLinks(links, now).map((l) => l.id)).toEqual(["c", "a"]);
  });
});

describe("normalizeUrl / isValidHttpUrl", () => {
  it("prefixes https when no protocol", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
  });
  it("preserves an existing protocol", () => {
    expect(normalizeUrl("http://x.com")).toBe("http://x.com");
  });
  it("validates urls", () => {
    expect(isValidHttpUrl("example.com")).toBe(true);
    expect(isValidHttpUrl("https://a.b/c")).toBe(true);
    expect(isValidHttpUrl("")).toBe(false);
  });
});
