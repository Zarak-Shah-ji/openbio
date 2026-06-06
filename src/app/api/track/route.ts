import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Records a page view for a public profile (fired as a beacon on page load). */
export async function POST(request: NextRequest) {
  let username: string | null = null;
  try {
    const body = (await request.json()) as { username?: unknown };
    if (typeof body.username === "string") username = body.username;
  } catch {
    // ignore malformed body
  }
  if (!username) return new NextResponse(null, { status: 400 });

  const supabase = await createClient();
  await supabase.rpc("record_event", {
    p_type: "view",
    p_username: username,
    p_referrer: request.headers.get("referer") ?? undefined,
    p_user_agent: request.headers.get("user-agent") ?? undefined,
  });

  return new NextResponse(null, { status: 204 });
}
