import { describe, it, expect } from "vitest";
import { leadsToCsv } from "@/lib/csv";

describe("leadsToCsv", () => {
  it("writes a header and a row", () => {
    expect(leadsToCsv([{ email: "a@b.com", created_at: "2026-06-06" }])).toBe(
      "email,created_at\na@b.com,2026-06-06",
    );
  });
  it("escapes commas and quotes", () => {
    expect(
      leadsToCsv([{ email: 'a,"x"@b.com', created_at: "d" }]),
    ).toContain('"a,""x""@b.com"');
  });
  it("returns just the header when empty", () => {
    expect(leadsToCsv([])).toBe("email,created_at");
  });
});
