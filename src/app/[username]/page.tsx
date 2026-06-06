import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { visibleLinks } from "@/lib/links";
import {
  buttonStyleProps,
  FONT_STACKS,
  mergeTheme,
  pageBackgroundStyle,
} from "@/lib/theme";
import { LeadCapture } from "@/components/public/lead-capture";
import { ViewBeacon } from "@/components/public/view-beacon";

async function getPageData(username: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return null;

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("position", { ascending: true });

  return { profile, links: links ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, seo_title, seo_description, avatar_url")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return { title: "Page not found · OpenBio" };

  const name = profile.display_name || profile.username;
  const title = profile.seo_title || `${name} · OpenBio`;
  const description =
    profile.seo_description || profile.bio || `Links from ${name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getPageData(username);
  if (!data) notFound();

  const { profile, links } = data;
  const theme = mergeTheme(profile.theme);
  const shown = visibleLinks(links);
  const name = profile.display_name || `@${profile.username}`;

  return (
    <div
      className="flex flex-1 flex-col"
      style={{
        ...pageBackgroundStyle(theme),
        color: theme.textColor,
        fontFamily: FONT_STACKS[theme.font],
        minHeight: "100dvh",
      }}
    >
      <ViewBeacon username={profile.username} />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-12">
        <div className="flex flex-col items-center text-center">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={name}
              className="size-24 rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full bg-black/20 text-3xl font-bold shadow-lg">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="mt-4 text-xl font-semibold">{name}</h1>
          {profile.bio && (
            <p className="mt-1 max-w-xs text-sm opacity-80">{profile.bio}</p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {shown.length === 0 ? (
            <p className="text-center text-sm opacity-70">No links yet.</p>
          ) : (
            shown.map((link) => (
              <a
                key={link.id}
                href={`/api/r/${link.id}`}
                rel="noopener"
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium shadow-sm transition-transform hover:-translate-y-0.5"
                style={buttonStyleProps(theme)}
              >
                {link.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={link.thumbnail_url}
                    alt=""
                    className="size-7 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  link.is_featured && <Star className="size-4 shrink-0" />
                )}
                <span className="flex-1 truncate text-center">{link.title}</span>
                {link.thumbnail_url && <span className="size-7 shrink-0" />}
              </a>
            ))
          )}
        </div>

        <div className="mt-8 rounded-xl border border-current/20 bg-white/5 p-4">
          <p className="mb-2 text-center text-sm font-medium">
            Subscribe for updates
          </p>
          <LeadCapture username={profile.username} theme={theme} />
        </div>
      </main>

      <footer className="pb-8 text-center">
        <Link href="/" className="text-xs opacity-70 hover:opacity-100">
          Made with OpenBio — build your own, free
        </Link>
      </footer>
    </div>
  );
}
