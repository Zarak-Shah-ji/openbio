import { describe, it, expect } from "vitest";
import {
  autoPosterUrl,
  detectSocial,
  displayHost,
  isSocialProfileUrl,
  partitionSocials,
  youTubeId,
} from "@/lib/social";

describe("detectSocial", () => {
  it("matches known platforms regardless of subdomain or www", () => {
    expect(detectSocial("https://www.instagram.com/zarak")).toBe("instagram");
    expect(detectSocial("https://open.spotify.com/artist/1")).toBe("spotify");
    expect(detectSocial("https://x.com/zarak")).toBe("x");
    expect(detectSocial("https://twitter.com/zarak")).toBe("x");
    expect(detectSocial("https://youtu.be/abc")).toBe("youtube");
  });

  it("treats mailto links as email", () => {
    expect(detectSocial("mailto:hi@example.com")).toBe("email");
  });

  it("does not match a lookalike domain", () => {
    // Suffix matching must respect the dot boundary.
    expect(detectSocial("https://notinstagram.com/zarak")).toBeNull();
    expect(detectSocial("https://myx.com")).toBeNull();
  });

  it("returns null for ordinary sites and unparseable input", () => {
    expect(detectSocial("https://example.com")).toBeNull();
    expect(detectSocial("not a url")).toBeNull();
  });
});

describe("youTubeId", () => {
  it("reads the id from every url shape", () => {
    expect(youTubeId("https://www.youtube.com/watch?v=abc123")).toBe("abc123");
    expect(youTubeId("https://youtu.be/abc123")).toBe("abc123");
    expect(youTubeId("https://www.youtube.com/shorts/abc123")).toBe("abc123");
    expect(youTubeId("https://www.youtube.com/embed/abc123")).toBe("abc123");
  });

  it("returns null for a channel or a non-youtube url", () => {
    expect(youTubeId("https://www.youtube.com/@zarak")).toBeNull();
    expect(youTubeId("https://vimeo.com/12345")).toBeNull();
  });

  it("respects the dot boundary on the host", () => {
    expect(youTubeId("https://notyoutube.com/watch?v=abc123")).toBeNull();
    expect(youTubeId("https://music.youtube.com/watch?v=abc123")).toBe("abc123");
  });
});

describe("isSocialProfileUrl", () => {
  it("treats bare handles as profiles", () => {
    for (const url of [
      "https://instagram.com/zarak",
      "https://tiktok.com/@zarak",
      "https://x.com/zarak",
      "https://github.com/zarak",
      "https://www.youtube.com/@zarak",
      "https://t.me/zarak",
      "https://facebook.com/",
    ]) {
      expect(isSocialProfileUrl(url)).toBe(true);
    }
  });

  it("treats prefixed profile paths as profiles", () => {
    expect(isSocialProfileUrl("https://linkedin.com/in/zarak")).toBe(true);
    expect(isSocialProfileUrl("https://open.spotify.com/artist/abc")).toBe(true);
    expect(isSocialProfileUrl("https://reddit.com/r/webdev")).toBe(true);
    expect(isSocialProfileUrl("https://youtube.com/channel/UCabc")).toBe(true);
  });

  it("treats a specific post, video or track as content", () => {
    for (const url of [
      "https://instagram.com/p/Cabc123",
      "https://instagram.com/reel/Cabc123",
      "https://open.spotify.com/album/abc",
      "https://open.spotify.com/track/abc",
      "https://x.com/zarak/status/12345",
      "https://youtu.be/abc123",
      "https://www.youtube.com/watch?v=abc123",
      "https://reddit.com/r/webdev/comments/abc/title",
      "https://tiktok.com/@zarak/video/12345",
    ]) {
      expect(isSocialProfileUrl(url)).toBe(false);
    }
  });
});

describe("autoPosterUrl", () => {
  it("builds a poster for a video and nothing for anything else", () => {
    expect(autoPosterUrl("https://youtu.be/abc123")).toContain("abc123");
    expect(autoPosterUrl("https://example.com")).toBeNull();
  });
});

describe("partitionSocials", () => {
  const links = [
    { id: "1", url: "https://instagram.com/zarak" },
    { id: "2", url: "https://example.com/shop" },
    { id: "3", url: "https://www.youtube.com/watch?v=abc123" },
    { id: "4", url: "https://www.youtube.com/@zarak" },
    { id: "5", url: "https://open.spotify.com/album/abc" },
    { id: "6", url: "https://instagram.com/p/Cabc" },
  ];

  it("returns everything as blocks when the row is off", () => {
    const { socials, rest } = partitionSocials(links, false);
    expect(socials).toHaveLength(0);
    expect(rest).toHaveLength(6);
  });

  it("moves profiles to the row and keeps content as titled blocks", () => {
    const { socials, rest } = partitionSocials(links, true);
    // The Instagram profile and the YouTube channel become glyphs...
    expect(socials.map((s) => s.link.id)).toEqual(["1", "4"]);
    // ...while the shop link, the video, the album and the post keep their
    // full blocks — collapsing those would throw away their titles.
    expect(rest.map((l) => l.id)).toEqual(["2", "3", "5", "6"]);
  });
});

describe("displayHost", () => {
  it("strips www and the scheme", () => {
    expect(displayHost("https://www.shop.example.com/a/b")).toBe(
      "shop.example.com",
    );
  });
  it("shows the address for mailto links", () => {
    expect(displayHost("mailto:hi@example.com?subject=x")).toBe("hi@example.com");
  });
});
