"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  changeUsername,
  setAvatarUrl,
  updateProfile,
  type FormState,
} from "@/app/dashboard/actions";
import { uploadMedia } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/auth";

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateProfile,
    {},
  );

  return (
    <div className="max-w-xl space-y-6">
      <AvatarSection profile={profile} onChange={() => router.refresh()} />
      <UsernameSection profile={profile} onChanged={() => router.refresh()} />

      <Card className="p-5">
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile.display_name ?? ""}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio ?? ""}
              placeholder="A short line about you"
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-sm font-medium">SEO</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="seo_title">Page title</Label>
                <Input
                  id="seo_title"
                  name="seo_title"
                  defaultValue={profile.seo_title ?? ""}
                  placeholder={`${profile.display_name || profile.username} · OpenLinq`}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo_description">Meta description</Label>
                <Textarea
                  id="seo_description"
                  name="seo_description"
                  defaultValue={profile.seo_description ?? ""}
                  placeholder="Shown in search results and link previews"
                />
              </div>
            </div>
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save profile"}
            </Button>
            {state.ok && (
              <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                <Check className="size-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

function UsernameSection({
  profile,
  onChanged,
}: {
  profile: Profile;
  onChanged: () => void;
}) {
  const [usernameState, usernameAction, usernamePending] = useActionState<FormState, FormData>(
    changeUsername,
    {},
  );

  useEffect(() => {
    if (usernameState.ok) onChanged();
  }, [usernameState.ok, onChanged]);

  return (
    <Card className="p-5">
      <form action={usernameAction} className="space-y-4">
        <div>
          <p className="text-sm font-medium">Username</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Current URL:{" "}
            <span className="font-mono">open-linq.com/{profile.username}</span>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">New username</Label>
          <Input
            id="username"
            name="username"
            defaultValue={profile.username}
            placeholder="your_username"
            pattern="[a-z0-9_]{3,30}"
          />
          <p className="text-xs text-muted-foreground">
            3–30 characters: lowercase letters, numbers and underscores only.
          </p>
        </div>
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          Changing your username will break any existing links shared with the old URL.
        </p>
        {usernameState.error && (
          <p className="text-sm text-red-600">{usernameState.error}</p>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={usernamePending}>
            {usernamePending ? "Saving…" : "Save username"}
          </Button>
          {usernameState.ok && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
              <Check className="size-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}

function AvatarSection({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadMedia(profile.id, file, "avatar");
      await setAvatarUrl(url);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="flex items-center gap-4 p-5">
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt=""
          className="size-16 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground">
          {(profile.display_name || profile.username).charAt(0).toUpperCase()}
        </div>
      )}
      <div className="space-y-2">
        <p className="text-sm font-medium">Profile photo</p>
        <div className="flex items-center gap-2">
          <label className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onFile(file);
              }}
            />
          </label>
          {profile.avatar_url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setAvatarUrl(null);
                  onChange();
                })
              }
            >
              Remove
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Card>
  );
}
