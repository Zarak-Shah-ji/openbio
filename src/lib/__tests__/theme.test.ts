import { describe, it, expect } from "vitest";
import {
  avatarShapeClass,
  backdropImageStyle,
  buttonStyleProps,
  DEFAULT_THEME,
  hasHeroHeader,
  heroImageUrl,
  heroMaskStyle,
  heroStyle,
  mergeTheme,
  pageBackgroundStyle,
  surfaceClassName,
  themeVars,
  tileClassName,
  type Theme,
} from "@/lib/theme";

describe("mergeTheme", () => {
  it("returns defaults for null or non-objects", () => {
    expect(mergeTheme(null)).toEqual(DEFAULT_THEME);
    expect(mergeTheme("nope")).toEqual(DEFAULT_THEME);
  });
  it("keeps valid fields and falls back for invalid ones", () => {
    const t = mergeTheme({
      bgColor: "#ffffff",
      buttonStyle: "pill",
      font: "bogus",
      background: "solid",
    });
    expect(t.bgColor).toBe("#ffffff");
    expect(t.buttonStyle).toBe("pill");
    expect(t.font).toBe(DEFAULT_THEME.font);
    expect(t.background).toBe("solid");
  });

  it("accepts the newly added button styles and fonts", () => {
    const t = mergeTheme({ buttonStyle: "hardshadow", font: "display" });
    expect(t.buttonStyle).toBe("hardshadow");
    expect(t.font).toBe("display");
    expect(mergeTheme({ buttonStyle: "underline", font: "slab" })).toMatchObject(
      { buttonStyle: "underline", font: "slab" },
    );
  });
});

describe("pageBackgroundStyle", () => {
  it("uses a gradient for gradient backgrounds", () => {
    expect(
      pageBackgroundStyle({ ...DEFAULT_THEME, background: "gradient" }).background,
    ).toContain("linear-gradient");
  });
  it("uses a flat color for solid backgrounds", () => {
    expect(
      pageBackgroundStyle({
        ...DEFAULT_THEME,
        background: "solid",
        bgColor: "#abcdef",
      }).background,
    ).toBe("#abcdef");
  });
});

describe("buttonStyleProps", () => {
  it("makes outline buttons transparent", () => {
    const s = buttonStyleProps({
      ...DEFAULT_THEME,
      buttonStyle: "outline",
      buttonColor: "#112233",
    });
    expect(s.backgroundColor).toBe("transparent");
    expect(s.color).toBe("#112233");
  });
  it("uses a full radius for pill buttons", () => {
    expect(
      buttonStyleProps({ ...DEFAULT_THEME, buttonStyle: "pill" }).borderRadius,
    ).toBe("9999px");
  });

  it("gives hardshadow buttons a hard offset shadow", () => {
    const s = buttonStyleProps({ ...DEFAULT_THEME, buttonStyle: "hardshadow" });
    expect(String(s.boxShadow)).toContain("4px 4px 0");
  });

  it("makes underline buttons transparent with a bottom border", () => {
    const s = buttonStyleProps({
      ...DEFAULT_THEME,
      buttonStyle: "underline",
      buttonColor: "#abcdef",
    });
    expect(s.backgroundColor).toBe("transparent");
    expect(String(s.borderBottom)).toContain("#abcdef");
  });

  it("leaves background and border to CSS for material surfaces", () => {
    // The `.ob-surface-*` classes own these; setting them inline would win
    // against the class and flatten the material.
    const s = buttonStyleProps({ ...DEFAULT_THEME, surface: "glass" });
    expect(s.backgroundColor).toBeUndefined();
    expect(s.border).toBeUndefined();
    expect(s.boxShadow).toBeUndefined();
    expect(s.borderRadius).toBe("14px");
  });

  it("labels translucent surfaces with the page text color", () => {
    const base: Theme = {
      ...DEFAULT_THEME,
      textColor: "#ff0000",
      buttonTextColor: "#00ff00",
    };
    expect(buttonStyleProps({ ...base, surface: "glass" }).color).toBe("#ff0000");
    expect(buttonStyleProps({ ...base, surface: "neon" }).color).toBe("#ff0000");
    // Chrome is opaque and light, so it keeps the dedicated label color.
    expect(buttonStyleProps({ ...base, surface: "chrome" }).color).toBe("#00ff00");
  });
});

describe("mergeTheme — appearance v2 fields", () => {
  it("defaults every new field to the pre-v2 behaviour", () => {
    // A theme saved by the old editor must render exactly as it used to.
    const legacy = mergeTheme({
      background: "gradient",
      bgColor: "#111111",
      buttonStyle: "pill",
      font: "serif",
    });
    expect(legacy.surface).toBe("flat");
    expect(legacy.effect).toBe("none");
    expect(legacy.motion).toBe("none");
    expect(legacy.grain).toBe(false);
    expect(legacy.vignette).toBe(false);
    expect(legacy.bgImageUrl).toBeNull();
    expect(legacy.avatarShape).toBe("circle");
  });

  it("keeps valid new values", () => {
    const t = mergeTheme({
      background: "image",
      bgImageUrl: "https://cdn.example.com/a.jpg",
      surface: "holo",
      effect: "starfield",
      motion: "float",
      avatarShape: "hex",
      avatarRing: true,
      grain: true,
    });
    expect(t.background).toBe("image");
    expect(t.bgImageUrl).toBe("https://cdn.example.com/a.jpg");
    expect(t.surface).toBe("holo");
    expect(t.effect).toBe("starfield");
    expect(t.motion).toBe("float");
    expect(t.avatarShape).toBe("hex");
    expect(t.avatarRing).toBe(true);
    expect(t.grain).toBe(true);
  });

  it("rejects unknown enum values", () => {
    const t = mergeTheme({ surface: "velvet", effect: "lasers", motion: "warp" });
    expect(t.surface).toBe("flat");
    expect(t.effect).toBe("none");
    expect(t.motion).toBe("none");
  });

  it("clamps numeric sliders into range", () => {
    expect(mergeTheme({ bgBlur: 999 }).bgBlur).toBe(60);
    expect(mergeTheme({ bgBlur: -20 }).bgBlur).toBe(0);
    expect(mergeTheme({ bgZoom: 10 }).bgZoom).toBe(100);
    expect(mergeTheme({ bgZoom: 9999 }).bgZoom).toBe(250);
    expect(mergeTheme({ bgDim: 50.6 }).bgDim).toBe(51);
    expect(mergeTheme({ bgBlur: "lots" }).bgBlur).toBe(DEFAULT_THEME.bgBlur);
    expect(mergeTheme({ bgZoom: NaN }).bgZoom).toBe(DEFAULT_THEME.bgZoom);
  });

  it("treats an empty image url as no image", () => {
    expect(mergeTheme({ bgImageUrl: "" }).bgImageUrl).toBeNull();
  });
});

describe("hero header", () => {
  it("defaults to the classic avatar so old pages are unchanged", () => {
    const legacy = mergeTheme({ bgColor: "#111111" });
    expect(legacy.header).toBe("classic");
    expect(legacy.linkLayout).toBe("row");
    expect(legacy.socialRow).toBe(false);
    expect(legacy.coverImageUrl).toBeNull();
    expect(hasHeroHeader(legacy)).toBe(false);
  });

  it("falls back to the profile avatar when no cover is set", () => {
    const t = mergeTheme({ header: "hero" });
    expect(heroImageUrl(t, "https://x/avatar.jpg")).toBe(
      "https://x/avatar.jpg",
    );
    expect(heroImageUrl({ ...t, coverImageUrl: "https://x/c.jpg" }, "https://x/avatar.jpg")).toBe(
      "https://x/c.jpg",
    );
    expect(heroImageUrl(t, null)).toBeNull();
  });

  it("sizes the hero in viewport units the preview can redefine", () => {
    const s = heroStyle({ ...DEFAULT_THEME, heroHeight: 42 }) as Record<
      string,
      string
    >;
    // Published as a variable too, so the photo can shape its crop box from it.
    expect(s["--ob-hero-h"]).toBe("calc(42 * var(--ob-vh, 1dvh))");
    expect(s.height).toBe("var(--ob-hero-h)");
  });

  it("skips the mask entirely at a hard edge", () => {
    expect(heroMaskStyle({ ...DEFAULT_THEME, heroFade: 100 })).toEqual({});
  });

  it("eases the fade so neither end of it reads as a line", () => {
    const mask = String(
      heroMaskStyle({ ...DEFAULT_THEME, heroFade: 60 }).maskImage,
    );
    // The ramp spans from where the fade starts to the very bottom...
    expect(mask).toContain("60.00%");
    expect(mask).toContain("rgba(0,0,0,0.000) 100.00%");

    const alphas = [...mask.matchAll(/rgba\(0,0,0,([\d.]+)\)/g)].map((m) =>
      Number(m[1]),
    );
    expect(alphas[0]).toBe(1);
    expect(alphas.at(-1)).toBe(0);
    // ...and it is monotonic, so the photo never brightens on the way out.
    for (let i = 1; i < alphas.length; i++) {
      expect(alphas[i]).toBeLessThan(alphas[i - 1]);
    }
    // Smoothstep is flat at both ends: the first and last steps move far less
    // than the middle one. A straight line would make all three equal, which
    // is what produced the visible seam.
    const first = alphas[0] - alphas[1];
    const middle = alphas[4] - alphas[6];
    expect(first).toBeLessThan(middle);
    expect(alphas.at(-2)! - alphas.at(-1)!).toBeLessThan(middle);
  });

  it("clamps the hero sliders", () => {
    expect(mergeTheme({ heroHeight: 5 }).heroHeight).toBe(20);
    expect(mergeTheme({ heroHeight: 500 }).heroHeight).toBe(75);
    expect(mergeTheme({ header: "spinning" }).header).toBe("classic");
    expect(mergeTheme({ linkLayout: "carousel" }).linkLayout).toBe("row");
  });
});

describe("block radius", () => {
  it("keeps a pill radius for button-shaped rows", () => {
    expect(
      buttonStyleProps({ ...DEFAULT_THEME, buttonStyle: "pill", linkLayout: "row" })
        .borderRadius,
    ).toBe("9999px");
  });

  it("caps a pill radius on image layouts so tiles are not circles", () => {
    for (const linkLayout of ["cover", "grid"] as const) {
      expect(
        buttonStyleProps({ ...DEFAULT_THEME, buttonStyle: "pill", linkLayout })
          .borderRadius,
      ).toBe("24px");
      expect(
        buttonStyleProps({
          ...DEFAULT_THEME,
          buttonStyle: "pill",
          surface: "glass",
          linkLayout,
        }).borderRadius,
      ).toBe("24px");
    }
  });

  it("leaves already-sane radii alone on image layouts", () => {
    expect(
      buttonStyleProps({
        ...DEFAULT_THEME,
        buttonStyle: "square",
        linkLayout: "grid",
      }).borderRadius,
    ).toBe("0px");
  });
});

describe("backdropImageStyle", () => {
  it("scales past the requested zoom to hide blurred edges", () => {
    const s = backdropImageStyle({
      ...DEFAULT_THEME,
      bgImageUrl: "https://cdn.example.com/a.jpg",
      bgZoom: 120,
      bgBlur: 30,
    });
    expect(s.filter).toBe("blur(30px)");
    // 120% zoom + 30px blur compensation.
    expect(s.transform).toBe("scale(1.500)");
  });

  it("omits the filter when there is no blur", () => {
    expect(
      backdropImageStyle({ ...DEFAULT_THEME, bgImageUrl: "https://x/a.jpg" })
        .filter,
    ).toBeUndefined();
  });

  it("quotes the url so it cannot break out of the css value", () => {
    const s = backdropImageStyle({
      ...DEFAULT_THEME,
      bgImageUrl: 'https://x/a.jpg") ; background: red; x: url("',
    });
    const value = String(s.backgroundImage);
    // The whole url stays inside one CSS string: it opens and closes exactly
    // once, and every quote the user supplied is backslash-escaped, so no
    // extra declaration can be injected.
    expect(value.startsWith('url("')).toBe(true);
    expect(value.endsWith('")')).toBe(true);
    expect(value.slice(5, -2)).not.toMatch(/(?<!\\)"/);
  });
});

describe("class helpers", () => {
  it("adds a material class only when the surface is not flat", () => {
    expect(surfaceClassName({ ...DEFAULT_THEME, surface: "flat" })).toBe("ob-tile");
    expect(surfaceClassName({ ...DEFAULT_THEME, surface: "neon" })).toBe(
      "ob-tile ob-surface-neon",
    );
  });

  it("adds an animation class only when motion is on", () => {
    expect(tileClassName({ ...DEFAULT_THEME, motion: "none" })).not.toContain(
      "ob-anim",
    );
    expect(tileClassName({ ...DEFAULT_THEME, motion: "pop" })).toContain(
      "ob-anim-pop",
    );
  });

  it("maps the avatar shape to its class", () => {
    expect(avatarShapeClass({ ...DEFAULT_THEME, avatarShape: "blob" })).toBe(
      "ob-avatar-blob",
    );
  });

  it("exposes the palette as custom properties for the css layer", () => {
    const vars = themeVars({ ...DEFAULT_THEME, accentColor: "#123456" }) as Record<
      string,
      string
    >;
    expect(vars["--ob-accent"]).toBe("#123456");
    expect(vars["--ob-ink"]).toBe(DEFAULT_THEME.textColor);
  });
});
