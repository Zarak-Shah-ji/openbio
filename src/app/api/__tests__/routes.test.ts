import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
const maybeSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
    rpc,
  })),
}));

import { POST as trackPOST } from "@/app/api/track/route";
import { GET as redirectGET } from "@/app/api/r/[linkId]/route";

beforeEach(() => {
  rpc.mockClear();
  maybeSingle.mockReset();
});

describe("POST /api/track", () => {
  it("records a view and returns 204", async () => {
    const req = new Request("http://localhost/api/track", {
      method: "POST",
      body: JSON.stringify({ username: "alice" }),
      headers: { "content-type": "application/json" },
    }) as NextRequest;

    const res = await trackPOST(req);
    expect(res.status).toBe(204);
    expect(rpc).toHaveBeenCalledWith(
      "record_event",
      expect.objectContaining({ p_type: "view", p_username: "alice" }),
    );
  });

  it("returns 400 and records nothing when username is missing", async () => {
    const req = new Request("http://localhost/api/track", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    }) as NextRequest;

    const res = await trackPOST(req);
    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe("GET /api/r/[linkId]", () => {
  it("logs a click and redirects to the destination", async () => {
    maybeSingle.mockResolvedValue({
      data: { url: "https://example.com/", is_active: true },
      error: null,
    });
    const req = new Request("http://localhost/api/r/abc") as NextRequest;

    const res = await redirectGET(req, {
      params: Promise.resolve({ linkId: "abc" }),
    });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/");
    expect(rpc).toHaveBeenCalledWith(
      "record_event",
      expect.objectContaining({ p_type: "click", p_link_id: "abc" }),
    );
  });

  it("redirects home without logging for a missing or inactive link", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    const req = new Request("http://localhost/api/r/none") as NextRequest;

    const res = await redirectGET(req, {
      params: Promise.resolve({ linkId: "none" }),
    });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
    expect(rpc).not.toHaveBeenCalled();
  });
});
