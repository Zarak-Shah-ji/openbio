import type { CSSProperties } from "react";

export type BackgroundStyle = "solid" | "gradient";
export type ButtonStyle = "rounded" | "pill" | "square" | "outline" | "shadow";
export type FontFamily = "sans" | "serif" | "mono";

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
      buttonStyle: "rounded",
      font: "sans",
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
];

const BUTTON_STYLES: ButtonStyle[] = [
  "rounded",
  "pill",
  "square",
  "outline",
  "shadow",
];
const FONTS: FontFamily[] = ["sans", "serif", "mono"];

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

export const FONT_STACKS: Record<FontFamily, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
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
  const outline = theme.buttonStyle === "outline";
  const base: CSSProperties = {
    backgroundColor: outline ? "transparent" : theme.buttonColor,
    color: outline ? theme.buttonColor : theme.buttonTextColor,
    border: outline
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
      base.boxShadow = "4px 4px 0 rgba(0,0,0,0.35)";
      break;
    case "rounded":
    case "outline":
    default:
      base.borderRadius = "12px";
  }
  return base;
}
