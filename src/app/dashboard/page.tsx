import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LinksEditor } from "@/components/dashboard/links-editor";
import { PhonePreview } from "@/components/dashboard/phone-preview";
import { visibleLinks } from "@/lib/links";
import { mergeTheme } from "@/lib/theme";

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const supabase = await createClient();
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .order("position", { ascending: true });

  const allLinks = links ?? [];
  const theme = mergeTheme(profile.theme);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Your links</h1>
          <p className="text-sm text-muted-foreground">
            Add, reorder, schedule and feature the links on your page.
          </p>
        </div>
        <LinksEditor userId={profile.id} initialLinks={allLinks} />
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-8">
          <PhonePreview
            profile={profile}
            links={visibleLinks(allLinks)}
            theme={theme}
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Live preview · only active, in-schedule links show
          </p>
        </div>
      </div>
    </div>
  );
}
