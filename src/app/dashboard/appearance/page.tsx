import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppearanceEditor } from "@/components/dashboard/appearance-editor";
import { visibleLinks } from "@/lib/links";
import { mergeTheme } from "@/lib/theme";

export default async function AppearancePage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const supabase = await createClient();
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .order("position", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Customize your page freely — no premium upsell, no watermark.
        </p>
      </div>
      <AppearanceEditor
        initialTheme={mergeTheme(profile.theme)}
        profile={profile}
        links={visibleLinks(links ?? [])}
      />
    </div>
  );
}
