// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "@/components/ui/switch";

describe("Switch", () => {
  it("reflects the checked prop and toggles on click", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Switch checked={false} onCheckedChange={onChange} aria-label="toggle" />,
    );

    const button = screen.getByRole("switch");
    expect(button.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(
      <Switch checked onCheckedChange={onChange} aria-label="toggle" />,
    );
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
  });
});
