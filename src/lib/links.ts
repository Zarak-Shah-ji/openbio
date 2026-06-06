import type { Database } from "@/lib/database.types";

export type LinkRow = Database["public"]["Tables"]["links"]["Row"];

type VisibilityFields = Pick<
  LinkRow,
  "is_active" | "visible_from" | "visible_until"
>;

/**
 * A link is shown on the public page when it is active AND the current time
 * falls within its (optional) scheduling window. This is the free version of
 * Linktree's paid "schedule links" feature.
 */
export function isLinkVisible(link: VisibilityFields, now: Date = new Date()): boolean {
  if (!link.is_active) return false;
  const t = now.getTime();
  if (link.visible_from && t < new Date(link.visible_from).getTime()) {
    return false;
  }
  if (link.visible_until && t > new Date(link.visible_until).getTime()) {
    return false;
  }
  return true;
}

/** Filter to currently-visible links, sorted by position then creation time. */
export function visibleLinks(links: LinkRow[], now: Date = new Date()): LinkRow[] {
  return links
    .filter((l) => isLinkVisible(l, now))
    .sort(byPositionThenCreated);
}

export function byPositionThenCreated(a: LinkRow, b: LinkRow): number {
  return a.position - b.position || a.created_at.localeCompare(b.created_at);
}

/** Ensure a user-entered URL has an http(s) protocol. */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidHttpUrl(input: string): boolean {
  try {
    const u = new URL(normalizeUrl(input));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
