import type { CSSProperties } from "react";

export type BackgroundStyle = "solid" | "gradient" | "image";
export type ButtonStyle =
  | "rounded"
  | "pill"
  | "square"
  | "outline"
  | "shadow"
  | "hardshadow"
  | "soft"
  | "underline";
export type FontFamily =
  | "sans"
  | "serif"
  | "mono"
  | "display"
  | "rounded"
  | "slab";

/**
 * Material applied to link tiles. `flat` is the original opaque look; the rest
 * are translucent/animated surfaces implemented by `.ob-surface-*` in
 * globals.css (they need CSS the style attribute can't express).
 */
export type Surface = "flat" | "glass" | "neon" | "holo" | "chrome";

/** Animated atmosphere drawn between the background and the content. */
export type Effect =
  | "none"
  | "aurora"
  | "mesh"
  | "grid"
  | "orbs"
  | "scanlines"
  | "starfield";

/** How link tiles enter and idle. */
export type Motion = "none" | "rise" | "float" | "pop";

export type AvatarShape = "circle" | "squircle" | "hex" | "blob";

/**
 * How the top of the page is composed.
 * - `classic`  small round avatar, centred (the original)
 * - `hero`     full-bleed photo that dissolves into the page, text below
 * - `banner`   full-bleed band with the avatar straddling its lower edge
 * - `immersive` full-bleed photo with the name and bio set over it
 */
export type HeaderStyle = "classic" | "hero" | "banner" | "immersive";

/** How each link block is presented. */
export type LinkLayout = "row" | "card" | "cover" | "grid";

export interface Theme {
  background: BackgroundStyle;
  bgColor: string;
  bgColorSecondary: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonStyle: ButtonStyle;
  font: FontFamily;

  /** Accent — drives glow, holo shimmer, effects and the avatar ring. */
  accentColor: string;

  /** Background photo, layered over the solid/gradient base. */
  bgImageUrl: string | null;
  /** Blur radius in px, 0–60. */
  bgBlur: number;
  /** Scale percentage, 100–250. */
  bgZoom: number;
  /** Darkening overlay percentage, 0–95 — keeps text readable over photos. */
  bgDim: number;

  effect: Effect;
  /** Film-grain overlay. */
  grain: boolean;
  /** Darkened edges, focuses the eye on the links. */
  vignette: boolean;

  surface: Surface;
  motion: Motion;
  avatarShape: AvatarShape;
  /** Animated iridescent ring around the avatar. */
  avatarRing: boolean;

  header: HeaderStyle;
  /** Hero/banner photo. Falls back to the profile avatar when empty. */
  coverImageUrl: string | null;
  /** Hero height as a percentage of the viewport, 20–75. */
  heroHeight: number;
  /**
   * Where the photo starts dissolving into the page, as a percentage of its
   * own height. 100 means a hard edge; lower values blend further up.
   */
  heroFade: number;
  /** Darkening scrim over the hero, 0–90 — legibility for overlaid text. */
  heroDim: number;

  linkLayout: LinkLayout;
  /** Pull recognised social links out of the list into a row of glyphs. */
  socialRow: boolean;
}

/**
 * Backwards-compatible baseline: every field added after launch defaults to the
 * pre-existing behaviour, so profiles saved with the old editor render exactly
 * as they did before.
 */
export const DEFAULT_THEME: Theme = {
  background: "gradient",
  bgColor: "#0f172a",
  bgColorSecondary: "#1e3a8a",
  textColor: "#f8fafc",
  buttonColor: "#f8fafc",
  buttonTextColor: "#0f172a",
  buttonStyle: "rounded",
  font: "sans",

  accentColor: "#6ee7ff",
  bgImageUrl: null,
  bgBlur: 0,
  bgZoom: 100,
  bgDim: 0,
  effect: "none",
  grain: false,
  vignette: false,
  surface: "flat",
  motion: "none",
  avatarShape: "circle",
  avatarRing: false,

  header: "classic",
  coverImageUrl: null,
  heroHeight: 40,
  heroFade: 50,
  heroDim: 0,
  linkLayout: "row",
  socialRow: false,
};

/** Applied to brand-new profiles so the default page already looks premium. */
export const SIGNATURE_THEME: Theme = {
  ...DEFAULT_THEME,
  background: "gradient",
  bgColor: "#05010f",
  bgColorSecondary: "#1b0b3a",
  textColor: "#f4f0ff",
  buttonColor: "#ffffff",
  buttonTextColor: "#05010f",
  buttonStyle: "soft",
  font: "display",
  accentColor: "#8b5cf6",
  effect: "aurora",
  grain: true,
  vignette: true,
  surface: "glass",
  motion: "rise",
  avatarShape: "squircle",
  avatarRing: true,
  header: "hero",
  heroHeight: 42,
  heroFade: 45,
  heroDim: 10,
  linkLayout: "card",
  socialRow: true,
};

/**
 * Named presets shown in the appearance editor. The first group is the
 * showcase — heavy on atmosphere and glass. The classics follow so existing
 * users can still find the look they had.
 */
export const THEME_PRESETS: { name: string; theme: Theme; showcase?: boolean }[] =
  [
    { name: "Aurora", theme: SIGNATURE_THEME, showcase: true },
    {
      name: "Hologram",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#070b16",
        bgColorSecondary: "#101a33",
        textColor: "#eaf4ff",
        buttonColor: "#dbeafe",
        buttonTextColor: "#070b16",
        buttonStyle: "pill",
        font: "display",
        accentColor: "#67e8f9",
        effect: "mesh",
        grain: true,
        vignette: true,
        surface: "holo",
        motion: "pop",
        avatarShape: "hex",
        avatarRing: true,
        header: "immersive",
        heroHeight: 46,
        heroFade: 46,
        heroDim: 32,
        linkLayout: "grid",
        socialRow: true,
      },
      showcase: true,
    },
    {
      name: "Neon Drift",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#12002e",
        bgColorSecondary: "#3d0a54",
        textColor: "#ffe9fb",
        buttonColor: "#ff4ecd",
        buttonTextColor: "#12002e",
        buttonStyle: "square",
        font: "mono",
        accentColor: "#ff4ecd",
        effect: "grid",
        grain: true,
        vignette: true,
        surface: "neon",
        motion: "rise",
        avatarShape: "squircle",
        avatarRing: true,
        header: "banner",
        heroHeight: 34,
        heroFade: 64,
        heroDim: 20,
        linkLayout: "cover",
        socialRow: true,
      },
      showcase: true,
    },
    {
      name: "Deep Space",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#01030c",
        bgColorSecondary: "#0a1230",
        textColor: "#e6ecff",
        buttonColor: "#c7d2fe",
        buttonTextColor: "#01030c",
        buttonStyle: "rounded",
        font: "sans",
        accentColor: "#818cf8",
        effect: "starfield",
        grain: false,
        vignette: true,
        surface: "glass",
        motion: "float",
        avatarShape: "circle",
        avatarRing: true,
        header: "hero",
        heroHeight: 44,
        heroFade: 45,
        heroDim: 15,
        linkLayout: "card",
        socialRow: true,
      },
      showcase: true,
    },
    {
      name: "Liquid Chrome",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#c8cdd6",
        bgColorSecondary: "#8e97a8",
        textColor: "#0b0d12",
        buttonColor: "#d7dce6",
        buttonTextColor: "#0b0d12",
        buttonStyle: "pill",
        font: "display",
        accentColor: "#5b6b8c",
        effect: "mesh",
        grain: true,
        vignette: false,
        surface: "chrome",
        motion: "pop",
        avatarShape: "blob",
        avatarRing: false,
        header: "banner",
        heroHeight: 32,
        heroFade: 70,
        heroDim: 0,
        linkLayout: "grid",
        socialRow: true,
      },
      showcase: true,
    },
    {
      name: "Bloom",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#fff1f6",
        bgColorSecondary: "#e0e7ff",
        textColor: "#3b0764",
        buttonColor: "#ffffff",
        buttonTextColor: "#3b0764",
        buttonStyle: "soft",
        font: "rounded",
        accentColor: "#f472b6",
        effect: "orbs",
        grain: false,
        vignette: false,
        surface: "glass",
        motion: "float",
        avatarShape: "blob",
        avatarRing: true,
        header: "hero",
        heroHeight: 40,
        heroFade: 42,
        heroDim: 0,
        linkLayout: "cover",
        socialRow: true,
      },
      showcase: true,
    },
    {
      name: "CRT",
      theme: {
        ...DEFAULT_THEME,
        background: "solid",
        bgColor: "#04140a",
        bgColorSecondary: "#04140a",
        textColor: "#7dffa8",
        buttonColor: "#7dffa8",
        buttonTextColor: "#04140a",
        buttonStyle: "outline",
        font: "mono",
        accentColor: "#7dffa8",
        effect: "scanlines",
        grain: true,
        vignette: true,
        surface: "neon",
        motion: "rise",
        avatarShape: "hex",
        avatarRing: false,
      },
      showcase: true,
    },
    { name: "Midnight", theme: DEFAULT_THEME },
    {
      name: "Sunset",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#7c2d12",
        bgColorSecondary: "#db2777",
        textColor: "#fff7ed",
        buttonColor: "#fff7ed",
        buttonTextColor: "#7c2d12",
        buttonStyle: "pill",
        font: "sans",
      },
    },
    {
      name: "Mint",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#064e3b",
        bgColorSecondary: "#10b981",
        textColor: "#ecfdf5",
        buttonColor: "#ecfdf5",
        buttonTextColor: "#064e3b",
        buttonStyle: "soft",
        font: "rounded",
      },
    },
    {
      name: "Paper",
      theme: {
        ...DEFAULT_THEME,
        background: "solid",
        bgColor: "#fafaf9",
        bgColorSecondary: "#e7e5e4",
        textColor: "#1c1917",
        buttonColor: "#1c1917",
        buttonTextColor: "#fafaf9",
        buttonStyle: "square",
        font: "serif",
      },
    },
    {
      name: "Terminal",
      theme: {
        ...DEFAULT_THEME,
        background: "solid",
        bgColor: "#0a0a0a",
        bgColorSecondary: "#171717",
        textColor: "#4ade80",
        buttonColor: "#4ade80",
        buttonTextColor: "#0a0a0a",
        buttonStyle: "outline",
        font: "mono",
      },
    },
    {
      name: "Brutalist",
      theme: {
        ...DEFAULT_THEME,
        background: "solid",
        bgColor: "#fde047",
        bgColorSecondary: "#facc15",
        textColor: "#0a0a0a",
        buttonColor: "#ffffff",
        buttonTextColor: "#0a0a0a",
        buttonStyle: "hardshadow",
        font: "display",
      },
    },
    {
      name: "Bubblegum",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#fbcfe8",
        bgColorSecondary: "#a78bfa",
        textColor: "#4a044e",
        buttonColor: "#ffffff",
        buttonTextColor: "#4a044e",
        buttonStyle: "pill",
        font: "rounded",
      },
    },
    {
      name: "Ocean",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#0c4a6e",
        bgColorSecondary: "#0ea5e9",
        textColor: "#f0f9ff",
        buttonColor: "#f0f9ff",
        buttonTextColor: "#0c4a6e",
        buttonStyle: "soft",
        font: "sans",
      },
    },
    {
      name: "Sand",
      theme: {
        ...DEFAULT_THEME,
        background: "solid",
        bgColor: "#f5f0e6",
        bgColorSecondary: "#e7dcc4",
        textColor: "#44342a",
        buttonColor: "#44342a",
        buttonTextColor: "#f5f0e6",
        buttonStyle: "hardshadow",
        font: "slab",
      },
    },
    {
      name: "Grape",
      theme: {
        ...DEFAULT_THEME,
        background: "gradient",
        bgColor: "#2e1065",
        bgColorSecondary: "#7c3aed",
        textColor: "#f5f3ff",
        buttonColor: "#f5f3ff",
        buttonTextColor: "#2e1065",
        buttonStyle: "underline",
        font: "display",
      },
    },
  ];

const BACKGROUNDS: BackgroundStyle[] = ["solid", "gradient", "image"];
const BUTTON_STYLES: ButtonStyle[] = [
  "rounded",
  "pill",
  "square",
  "outline",
  "shadow",
  "hardshadow",
  "soft",
  "underline",
];
const FONTS: FontFamily[] = [
  "sans",
  "serif",
  "mono",
  "display",
  "rounded",
  "slab",
];
const SURFACES: Surface[] = ["flat", "glass", "neon", "holo", "chrome"];
const EFFECTS: Effect[] = [
  "none",
  "aurora",
  "mesh",
  "grid",
  "orbs",
  "scanlines",
  "starfield",
];
const MOTIONS: Motion[] = ["none", "rise", "float", "pop"];
const AVATAR_SHAPES: AvatarShape[] = ["circle", "squircle", "hex", "blob"];
const HEADERS: HeaderStyle[] = ["classic", "hero", "banner", "immersive"];
const LINK_LAYOUTS: LinkLayout[] = ["row", "card", "cover", "grid"];

/** Coerce an arbitrary JSON value from the database into a complete Theme. */
export function mergeTheme(value: unknown): Theme {
  if (!value || typeof value !== "object") return { ...DEFAULT_THEME };
  const v = value as Record<string, unknown>;

  const str = (key: keyof Theme): string =>
    typeof v[key] === "string" ? (v[key] as string) : (DEFAULT_THEME[key] as string);

  const num = (key: keyof Theme, min: number, max: number): number => {
    const raw = v[key];
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return DEFAULT_THEME[key] as number;
    }
    return Math.min(max, Math.max(min, Math.round(raw)));
  };

  const bool = (key: keyof Theme): boolean =>
    typeof v[key] === "boolean" ? (v[key] as boolean) : (DEFAULT_THEME[key] as boolean);

  const oneOf = <T extends string>(key: keyof Theme, allowed: T[]): T =>
    allowed.includes(v[key] as T) ? (v[key] as T) : (DEFAULT_THEME[key] as T);

  return {
    // `background` keeps its historic fallback: anything unrecognised is a
    // gradient, not the default's value.
    background: BACKGROUNDS.includes(v.background as BackgroundStyle)
      ? (v.background as BackgroundStyle)
      : "gradient",
    bgColor: str("bgColor"),
    bgColorSecondary: str("bgColorSecondary"),
    textColor: str("textColor"),
    buttonColor: str("buttonColor"),
    buttonTextColor: str("buttonTextColor"),
    buttonStyle: oneOf("buttonStyle", BUTTON_STYLES),
    font: oneOf("font", FONTS),

    accentColor: str("accentColor"),
    bgImageUrl: typeof v.bgImageUrl === "string" && v.bgImageUrl ? v.bgImageUrl : null,
    bgBlur: num("bgBlur", 0, 60),
    bgZoom: num("bgZoom", 100, 250),
    bgDim: num("bgDim", 0, 95),

    effect: oneOf("effect", EFFECTS),
    grain: bool("grain"),
    vignette: bool("vignette"),
    surface: oneOf("surface", SURFACES),
    motion: oneOf("motion", MOTIONS),
    avatarShape: oneOf("avatarShape", AVATAR_SHAPES),
    avatarRing: bool("avatarRing"),

    header: oneOf("header", HEADERS),
    coverImageUrl:
      typeof v.coverImageUrl === "string" && v.coverImageUrl
        ? v.coverImageUrl
        : null,
    heroHeight: num("heroHeight", 20, 75),
    heroFade: num("heroFade", 0, 100),
    heroDim: num("heroDim", 0, 90),
    linkLayout: oneOf("linkLayout", LINK_LAYOUTS),
    socialRow: bool("socialRow"),
  };
}

// `--font-*` CSS variables are defined on <html> via next/font in layout.tsx.
export const FONT_STACKS: Record<FontFamily, string> = {
  sans: 'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  display: 'var(--font-display), ui-sans-serif, system-ui, sans-serif',
  rounded: 'var(--font-rounded), ui-rounded, "Segoe UI", system-ui, sans-serif',
  slab: 'var(--font-slab), ui-serif, Georgia, "Times New Roman", serif',
};

/** Inline style for the public page background. */
export function pageBackgroundStyle(theme: Theme): CSSProperties {
  // `image` still paints the gradient underneath — it shows through while the
  // photo loads and wherever the photo doesn't cover.
  if (theme.background === "solid") return { background: theme.bgColor };
  return {
    background: `linear-gradient(160deg, ${theme.bgColor} 0%, ${theme.bgColorSecondary} 100%)`,
  };
}

/**
 * CSS custom properties the `.ob-*` classes read. Set once on the page root so
 * every layer and tile below inherits the user's palette.
 */
export function themeVars(theme: Theme): CSSProperties {
  return {
    "--ob-bg": theme.bgColor,
    "--ob-bg-2": theme.bgColorSecondary,
    "--ob-ink": theme.textColor,
    "--ob-btn": theme.buttonColor,
    "--ob-btn-ink": theme.buttonTextColor,
    "--ob-accent": theme.accentColor,
  } as CSSProperties;
}

/** Inline style for the blurred/zoomed background photo layer. */
export function backdropImageStyle(theme: Theme): CSSProperties {
  // Blurring a layer softens its edges, so scale past the requested zoom by
  // enough to push those edges outside the viewport.
  const scale = theme.bgZoom / 100 + theme.bgBlur / 100;
  return {
    backgroundImage: `url(${JSON.stringify(theme.bgImageUrl ?? "")})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: theme.bgBlur > 0 ? `blur(${theme.bgBlur}px)` : undefined,
    transform: `scale(${scale.toFixed(3)})`,
  };
}

/** Inline style for the darkening scrim above the photo. */
export function backdropDimStyle(theme: Theme): CSSProperties {
  return { backgroundColor: `rgba(0,0,0,${(theme.bgDim / 100).toFixed(2)})` };
}

const RADIUS: Record<ButtonStyle, string> = {
  rounded: "14px",
  pill: "9999px",
  square: "0px",
  outline: "14px",
  shadow: "14px",
  hardshadow: "8px",
  soft: "20px",
  underline: "0px",
};

/** Layouts whose blocks are dominated by an image rather than a label. */
function isMediaLayout(theme: Theme): boolean {
  return theme.linkLayout === "cover" || theme.linkLayout === "grid";
}

/**
 * Corner radius for a block.
 *
 * A pill radius is right for a 48px-tall button and absurd on a 160px-tall
 * image tile — it turns the tile into a circle and crops the picture. Media
 * layouts therefore cap it at a generous-but-sane rounding.
 */
function blockRadius(theme: Theme): string {
  const radius = RADIUS[theme.buttonStyle];
  return isMediaLayout(theme) && radius === "9999px" ? "24px" : radius;
}

/**
 * Inline style for a link tile.
 *
 * For `flat` this is the complete look (unchanged from the original editor).
 * For the material surfaces it deliberately omits background/border/shadow —
 * those come from the `.ob-surface-*` class, which inline styles would win
 * against.
 */
export function buttonStyleProps(theme: Theme): CSSProperties {
  if (theme.surface !== "flat") {
    return {
      borderRadius: blockRadius(theme),
      fontFamily: FONT_STACKS[theme.font],
      // Translucent tiles sit on the page background, so the page ink is the
      // only colour guaranteed to stay readable. Chrome is opaque and light.
      color: theme.surface === "chrome" ? theme.buttonTextColor : theme.textColor,
    };
  }

  const transparentBg =
    theme.buttonStyle === "outline" || theme.buttonStyle === "underline";
  const base: CSSProperties = {
    backgroundColor: transparentBg ? "transparent" : theme.buttonColor,
    color: transparentBg ? theme.buttonColor : theme.buttonTextColor,
    border:
      theme.buttonStyle === "outline"
        ? `2px solid ${theme.buttonColor}`
        : "2px solid transparent",
    fontFamily: FONT_STACKS[theme.font],
  };

  switch (theme.buttonStyle) {
    case "pill":
      base.borderRadius = "9999px";
      break;
    case "square":
      base.borderRadius = "0px";
      break;
    case "shadow":
      base.borderRadius = "12px";
      base.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
      break;
    case "hardshadow":
      base.borderRadius = "8px";
      base.border = `2px solid ${theme.buttonTextColor}`;
      base.boxShadow = `4px 4px 0 ${theme.buttonTextColor}`;
      break;
    case "soft":
      base.borderRadius = "18px";
      base.boxShadow = "0 4px 14px rgba(0,0,0,0.12)";
      break;
    case "underline":
      base.borderRadius = "0px";
      base.border = "0";
      base.borderBottom = `2px solid ${theme.buttonColor}`;
      break;
    case "rounded":
    case "outline":
    default:
      base.borderRadius = "12px";
  }

  if (isMediaLayout(theme) && base.borderRadius === "9999px") {
    base.borderRadius = "24px";
  }
  return base;
}

/** Material class for anything that should share the link tiles' look. */
export function surfaceClassName(theme: Theme): string {
  return theme.surface === "flat"
    ? "ob-tile"
    : `ob-tile ob-surface-${theme.surface}`;
}

/** Class list for a link tile: material + entrance/idle animation. */
export function tileClassName(theme: Theme): string {
  const surface = surfaceClassName(theme);
  return theme.motion === "none" ? surface : `${surface} ob-anim-${theme.motion}`;
}

/** Stagger index for a tile's entrance animation. */
export function tileVars(index: number): CSSProperties {
  return { "--ob-i": index } as CSSProperties;
}

/**
 * Shape class for the avatar. Applied to both the ring wrapper and the image
 * inside it so the ring follows the silhouette instead of boxing it.
 */
export function avatarShapeClass(theme: Theme): string {
  return `ob-avatar-${theme.avatarShape}`;
}

/** The photo used by the hero/banner header, falling back to the avatar. */
export function heroImageUrl(
  theme: Theme,
  avatarUrl: string | null,
): string | null {
  return theme.coverImageUrl ?? avatarUrl ?? null;
}

/** True when the header paints a full-bleed photo above the content. */
export function hasHeroHeader(theme: Theme): boolean {
  return theme.header !== "classic";
}

/**
 * Defines what "1% of the screen" means for hero sizing. The live page passes
 * `1dvh`; the dashboard preview passes a hundredth of its phone frame so the
 * same theme yields the same proportions in both.
 */
export function viewportUnitStyle(unit: string): CSSProperties {
  return { "--ob-vh": unit } as CSSProperties;
}

/**
 * Sizing + fade for the hero.
 *
 * Height is expressed in `--ob-vh` units rather than `dvh` directly: the live
 * page sets that to `1dvh`, while the dashboard preview sets it to a hundredth
 * of the phone frame, so "40% of the screen" means the same thing in both.
 */
export function heroStyle(theme: Theme): CSSProperties {
  // Published as a variable as well as a height: the photo inside uses it to
  // keep its crop box the same shape on a wide screen as on a phone.
  return {
    "--ob-hero-h": `calc(${theme.heroHeight} * var(--ob-vh, 1dvh))`,
    height: "var(--ob-hero-h)",
  } as CSSProperties;
}

/**
 * Mask that dissolves the bottom of the photo into the page. `heroFade` is
 * where the dissolve begins as a percentage of the photo's height, so 100 is a
 * hard edge and 40 fades across most of it.
 *
 * The ramp is an eased curve rather than a straight line. A linear fade is
 * still ~13% opaque a few pixels before it ends and then stops dead, which the
 * eye reads as a hard line across the photo — the exact seam the mask exists
 * to remove. Smoothstep is flat at both ends, so the photo leaves and arrives
 * without an edge.
 */
const SMOOTHSTEP_STOPS = 10;

export function heroMaskStyle(theme: Theme): CSSProperties {
  if (theme.heroFade >= 100) return {};

  const span = 100 - theme.heroFade;
  const stops = ["#000 0%"];
  for (let i = 0; i <= SMOOTHSTEP_STOPS; i++) {
    const t = i / SMOOTHSTEP_STOPS;
    const alpha = 1 - t * t * (3 - 2 * t);
    const position = theme.heroFade + span * t;
    stops.push(`rgba(0,0,0,${alpha.toFixed(3)}) ${position.toFixed(2)}%`);
  }

  const gradient = `linear-gradient(to bottom, ${stops.join(", ")})`;
  return {
    WebkitMaskImage: gradient,
    maskImage: gradient,
  } as CSSProperties;
}

/** Scrim over the hero photo, for legibility of any text set on top of it. */
export function heroDimStyle(theme: Theme): CSSProperties {
  return { backgroundColor: `rgba(0,0,0,${(theme.heroDim / 100).toFixed(2)})` };
}
