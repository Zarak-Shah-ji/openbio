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

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;

  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}
