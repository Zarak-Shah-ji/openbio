import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Your profile photo, name, bio, username and SEO metadata.
        </p>
      </div>
      <SettingsForm profile={profile} />
    </div>
  );
}
