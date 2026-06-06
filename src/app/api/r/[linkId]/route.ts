import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Click tracker: logs the click then 302-redirects to the destination URL. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { linkId } = await params;
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("links")
    .select("url, is_active")
    .eq("id", linkId)
    .maybeSingle();

  if (!link || !link.is_active) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await supabase.rpc("record_event", {
    p_type: "click",
    p_link_id: linkId,
    p_referrer: request.headers.get("referer") ?? undefined,
    p_user_agent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.redirect(link.url);
}
