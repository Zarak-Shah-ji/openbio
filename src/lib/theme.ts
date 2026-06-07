import type { CSSProperties } from "react";

export type BackgroundStyle = "solid" | "gradient";
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

export interface Theme {
  background: BackgroundStyle;
  bgColor: string;
  bgColorSecondary: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonStyle: ButtonStyle;
  font: FontFamily;
}

export const DEFAULT_THEME: Theme = {
  background: "gradient",
  bgColor: "#0f172a",
  bgColorSecondary: "#1e3a8a",
  textColor: "#f8fafc",
  buttonColor: "#f8fafc",
  buttonTextColor: "#0f172a",
  buttonStyle: "rounded",
  font: "sans",
};

/** Named presets shown in the appearance editor. */
export const THEME_PRESETS: { name: string; theme: Theme }[] = [
  { name: "Midnight", theme: DEFAULT_THEME },
  {
    name: "Sunset",
    theme: {
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

/** Coerce an arbitrary JSON value from the database into a complete Theme. */
export function mergeTheme(value: unknown): Theme {
  if (!value || typeof value !== "object") return { ...DEFAULT_THEME };
  const v = value as Record<string, unknown>;

  const str = (key: keyof Theme): string =>
    typeof v[key] === "string" ? (v[key] as string) : (DEFAULT_THEME[key] as string);

  return {
    background: v.background === "solid" ? "solid" : "gradient",
    bgColor: str("bgColor"),
    bgColorSecondary: str("bgColorSecondary"),
    textColor: str("textColor"),
    buttonColor: str("buttonColor"),
    buttonTextColor: str("buttonTextColor"),
    buttonStyle: BUTTON_STYLES.includes(v.buttonStyle as ButtonStyle)
      ? (v.buttonStyle as ButtonStyle)
      : DEFAULT_THEME.buttonStyle,
    font: FONTS.includes(v.font as FontFamily)
      ? (v.font as FontFamily)
      : DEFAULT_THEME.font,
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
  if (theme.background === "gradient") {
    return {
      background: `linear-gradient(160deg, ${theme.bgColor} 0%, ${theme.bgColorSecondary} 100%)`,
    };
  }
  return { background: theme.bgColor };
}

/** Inline style for a link button, derived from the theme's button settings. */
export function buttonStyleProps(theme: Theme): CSSProperties {
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
  return base;
}
