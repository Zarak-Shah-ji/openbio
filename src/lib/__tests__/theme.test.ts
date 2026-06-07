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
});
