"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isValidHttpUrl, normalizeUrl } from "@/lib/links";
import { mergeTheme, SIGNATURE_THEME, type Theme } from "@/lib/theme";
import type { Database, Json } from "@/lib/database.types";

type LinkUpdate = Database["public"]["Tables"]["links"]["Update"];

export type FormState = { error?: string; ok?: boolean };

const usernameSchema = z
  .string()
  .regex(
    /^[a-z0-9_]{3,30}$/,
    "3–30 characters: lowercase letters, numbers and underscores only.",
  );

// Usernames that would collide with app routes.
const RESERVED_USERNAMES = new Set([
  "login",
  "signup",
  "dashboard",
  "onboarding",
  "api",
  "auth",
  "settings",
  "appearance",
  "analytics",
  "admin",
  "about",
  "terms",
  "privacy",
]);

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

/** Onboarding: claim a unique username and create the profile row. */
export async function claimUsername(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };

  const username = String(formData.get("username") ?? "")
    .toLowerCase()
    .trim();
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid username" };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return { error: "That username is reserved." };
  }

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (taken) return { error: "That username is already taken." };

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    username,
    display_name: username,
    // New pages start on the signature look rather than the bare baseline.
    // Existing profiles are untouched — their stored theme still wins.
    theme: SIGNATURE_THEME as unknown as Json,
  });
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "That username is already taken."
        : error.message,
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

const profileSchema = z.object({
  display_name: z.string().max(80).optional(),
  bio: z.string().max(500).optional(),
  seo_title: z.string().max(120).optional(),
  seo_description: z.string().max(300).optional(),
});

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };

  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name") || undefined,
    bio: formData.get("bio") || undefined,
    seo_title: formData.get("seo_title") || undefined,
    seo_description: formData.get("seo_description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name ?? null,
      bio: parsed.data.bio ?? null,
      seo_title: parsed.data.seo_title ?? null,
      seo_description: parsed.data.seo_description ?? null,
    })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function changeUsername(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };

  const username = String(formData.get("username") ?? "")
    .toLowerCase()
    .trim();
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid username" };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return { error: "That username is reserved." };
  }

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", userId)
    .maybeSingle();
  if (taken) return { error: "That username is already taken." };

  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", userId);
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "That username is already taken."
        : error.message,
    };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setAvatarUrl(url: string | null) {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

/** Appearance editor: persist the theme JSON. */
export async function saveTheme(theme: Theme): Promise<FormState> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };

  const clean = mergeTheme(theme) as unknown as Json;
  const { error } = await supabase
    .from("profiles")
    .update({ theme: clean })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/appearance");
  revalidatePath("/", "layout");
  return { ok: true };
}

const linkSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  url: z.string().min(1, "URL is required"),
});

export async function createLink(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };

  const parsed = linkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!isValidHttpUrl(parsed.data.url)) {
    return { error: "Enter a valid URL." };
  }

  const { data: last } = await supabase
    .from("links")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("links").insert({
    user_id: userId,
    title: parsed.data.title.trim(),
    url: normalizeUrl(parsed.data.url),
    position: (last?.position ?? -1) + 1,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateLink(
  id: string,
  patch: {
    title?: string;
    url?: string;
    thumbnail_url?: string | null;
    visible_from?: string | null;
    visible_until?: string | null;
  },
): Promise<FormState> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };

  const update: LinkUpdate = {};
  if (patch.title !== undefined) {
    if (!patch.title.trim()) return { error: "Title is required." };
    update.title = patch.title.trim();
  }
  if (patch.url !== undefined) {
    if (!isValidHttpUrl(patch.url)) return { error: "Enter a valid URL." };
    update.url = normalizeUrl(patch.url);
  }
  if (patch.thumbnail_url !== undefined) update.thumbnail_url = patch.thumbnail_url;
  if (patch.visible_from !== undefined) update.visible_from = patch.visible_from;
  if (patch.visible_until !== undefined)
    update.visible_until = patch.visible_until;

  const { error } = await supabase
    .from("links")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setLinkFlag(
  id: string,
  flag: "is_active" | "is_featured",
  value: boolean,
): Promise<FormState> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };

  const update: LinkUpdate =
    flag === "is_active" ? { is_active: value } : { is_featured: value };
  const { error } = await supabase
    .from("links")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteLink(id: string): Promise<FormState> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function reorderLinks(orderedIds: string[]): Promise<FormState> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "You must be signed in." };

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("links")
        .update({ position: index })
        .eq("id", id)
        .eq("user_id", userId),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { ok: true };
}
