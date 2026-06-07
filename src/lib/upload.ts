import { createClient } from "@/lib/supabase/client";

/**
 * Uploads a file to the public `media` bucket under the user's folder and
 * returns its public URL. Storage RLS requires the first path segment to be
 * the user's id, so uploads are scoped per-user.
 */
export async function uploadMedia(
  userId: string,
  file: File,
  prefix: string,
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${prefix}-${Date.now()}.${ext}`;

  // Filenames are unique (Date.now), so no upsert is needed — this avoids the
  // existence check that requires a storage SELECT policy.
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { upsert: false, cacheControl: "3600" });
  if (error) throw error;

  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}
