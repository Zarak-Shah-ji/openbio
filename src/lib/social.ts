export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "github"
  | "spotify"
  | "threads"
  | "whatsapp"
  | "telegram"
  | "discord"
  | "twitch"
  | "pinterest"
  | "reddit"
  | "email";

/**
 * Hosts that identify a platform. Matched against the registrable part of the
 * hostname, so `www.` and country subdomains all resolve the same way.
 */
const HOSTS: [SocialPlatform, string[]][] = [
  ["instagram", ["instagram.com", "instagr.am"]],
  ["tiktok", ["tiktok.com"]],
  ["x", ["x.com", "twitter.com", "t.co"]],
  ["youtube", ["youtube.com", "youtu.be"]],
  ["facebook", ["facebook.com", "fb.com", "fb.me"]],
  ["linkedin", ["linkedin.com", "lnkd.in"]],
  ["github", ["github.com"]],
  ["spotify", ["spotify.com", "open.spotify.com"]],
  ["threads", ["threads.net", "threads.com"]],
  ["whatsapp", ["whatsapp.com", "wa.me"]],
  ["telegram", ["telegram.me", "t.me", "telegram.org"]],
  ["discord", ["discord.com", "discord.gg"]],
  ["twitch", ["twitch.tv"]],
  ["pinterest", ["pinterest.com", "pin.it"]],
  ["reddit", ["reddit.com"]],
];

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  github: "GitHub",
  spotify: "Spotify",
  threads: "Threads",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  discord: "Discord",
  twitch: "Twitch",
  pinterest: "Pinterest",
  reddit: "Reddit",
  email: "Email",
};

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Identify which platform a URL points at, or null if it isn't a known one. */
export function detectSocial(url: string): SocialPlatform | null {
  if (url.toLowerCase().startsWith("mailto:")) return "email";

  const host = hostOf(url);
  if (!host) return null;

  for (const [platform, hosts] of HOSTS) {
    // Suffix match so `open.spotify.com` and `music.youtube.com` both count,
    // while `notinstagram.com` does not.
    if (hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      return platform;
    }
  }
  return null;
}

/** Path segments that mark a URL as a specific piece of content. */
const CONTENT_SEGMENTS = new Set([
  "p",
  "reel",
  "reels",
  "tv",
  "watch",
  "shorts",
  "short",
  "video",
  "videos",
  "status",
  "statuses",
  "album",
  "track",
  "playlist",
  "episode",
  "show",
  "comments",
  "posts",
  "post",
  "pulse",
  "clip",
  "clips",
  "live",
  "embed",
  "events",
  "pin",
]);

/**
 * Segments that introduce a profile rather than a post, e.g. `/in/<name>` on
 * LinkedIn or `/artist/<id>` on Spotify.
 */
const PROFILE_SEGMENTS = new Set([
  "in",
  "company",
  "school",
  "artist",
  "user",
  "channel",
  "c",
  "r",
  "u",
]);

/**
 * Whether a recognised social URL points at somebody's profile rather than one
 * post, video or track.
 *
 * Only profiles belong in the glyph row: collapsing "Listen to the new album"
 * into an anonymous Spotify icon throws away the title, which is the whole
 * reason the visitor would have clicked.
 */
export function isSocialProfileUrl(url: string): boolean {
  // Covers youtu.be/<id>, which looks like a one-segment profile path.
  if (youTubeId(url) !== null) return false;

  let segments: string[];
  try {
    segments = new URL(url).pathname.split("/").filter(Boolean);
  } catch {
    return false;
  }

  if (segments.some((s) => CONTENT_SEGMENTS.has(s.toLowerCase()))) return false;
  if (segments.length <= 1) return true;
  return segments.length === 2 && PROFILE_SEGMENTS.has(segments[0].toLowerCase());
}

/**
 * Split a link list into the ones that belong in the social glyph row and the
 * ones that stay as full blocks. Returns everything as `rest` when the row is
 * switched off, so the caller doesn't need to branch.
 */
export function partitionSocials<T extends { url: string }>(
  links: T[],
  enabled: boolean,
): { socials: { link: T; platform: SocialPlatform }[]; rest: T[] } {
  if (!enabled) return { socials: [], rest: links };

  const socials: { link: T; platform: SocialPlatform }[] = [];
  const rest: T[] = [];
  for (const link of links) {
    const platform = detectSocial(link.url);
    if (platform && isSocialProfileUrl(link.url)) {
      socials.push({ link, platform });
    } else {
      rest.push(link);
    }
  }
  return { socials, rest };
}

/** The YouTube video id in a watch/short/youtu.be URL, if there is one. */
export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");

    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    // Dot boundary, or `notyoutube.com` would match.
    if (host !== "youtube.com" && !host.endsWith(".youtube.com")) return null;

    const v = u.searchParams.get("v");
    if (v) return v;

    // /shorts/<id>, /embed/<id> and /live/<id> all carry the id in the path.
    const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Poster image for a link that has no thumbnail of its own. YouTube exposes a
 * predictable still for every video, which turns a bare video URL into a
 * proper media card without the user uploading anything.
 */
export function autoPosterUrl(url: string): string | null {
  const id = youTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Hostname shown as the subtitle on card layouts, e.g. "youtube.com". */
export function displayHost(url: string): string {
  if (url.toLowerCase().startsWith("mailto:")) {
    return url.slice(7).split("?")[0] || "email";
  }
  return hostOf(url) ?? "";
}
