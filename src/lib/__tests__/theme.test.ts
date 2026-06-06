import { describe, it, expect } from "vitest";
import {
  buttonStyleProps,
  DEFAULT_THEME,
  mergeTheme,
  pageBackgroundStyle,
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
});
