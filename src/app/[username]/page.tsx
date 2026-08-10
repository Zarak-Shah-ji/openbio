import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { visibleLinks } from "@/lib/links";
import { partitionSocials } from "@/lib/social";
import {
  FONT_STACKS,
  hasHeroHeader,
  mergeTheme,
  pageBackgroundStyle,
  themeVars,
  viewportUnitStyle,
} from "@/lib/theme";
import { Backdrop } from "@/components/public/backdrop";
import { Hero, Identity } from "@/components/public/hero";
import { LinkBlocks } from "@/components/public/link-blocks";
import { SocialRow } from "@/components/public/social-row";
import { LeadCapture } from "@/components/public/lead-capture";
import { ViewBeacon } from "@/components/public/view-beacon";
import { cn } from "@/lib/utils";

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
    .select(
      "username, display_name, bio, seo_title, seo_description, avatar_url, theme",
    )
    .eq("username", username)
    .maybeSingle();

  if (!profile) return { title: "Page not found · OpenLinq" };

  const name = profile.display_name || profile.username;
  const title = profile.seo_title || `${name} · OpenLinq`;
  const description =
    profile.seo_description || profile.bio || `Links from ${name}.`;
  // The cover is the page's real hero image, so it makes the better share card.
  const share = mergeTheme(profile.theme).coverImageUrl ?? profile.avatar_url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: share ? [share] : [],
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
  const { socials, rest } = partitionSocials(shown, theme.socialRow);
  const glassy = theme.surface !== "flat";

  return (
    <div
      className="ob-page flex flex-1 flex-col"
      style={{
        ...pageBackgroundStyle(theme),
        ...themeVars(theme),
        color: theme.textColor,
        fontFamily: FONT_STACKS[theme.font],
        minHeight: "100dvh",
        ...viewportUnitStyle("1dvh"),
      }}
    >
      <Backdrop theme={theme} />
      <ViewBeacon username={profile.username} />

      <div className="ob-content flex flex-1 flex-col">
        {hasHeroHeader(theme) && <Hero theme={theme} profile={profile} />}

        <main
          className={cn(
            "mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-12",
            theme.header === "classic" && "pt-12",
            theme.header === "hero" && "pt-6",
            theme.header === "immersive" && "pt-8",
            theme.header === "banner" && "ob-below-banner",
          )}
        >
          {/* `classic` keeps the avatar with the text; the full-bleed headers
              have already shown the photo, so only the text is left — except
              `immersive`, which set it over the image itself. */}
          {theme.header === "classic" && <Hero theme={theme} profile={profile} />}
          {(theme.header === "hero" || theme.header === "banner") && (
            <Identity profile={profile} />
          )}

          <SocialRow
            items={socials}
            hrefFor={(link) => `/api/r/${link.id}`}
          />

          <div className="mt-8">
            {shown.length === 0 ? (
              <p className="text-center text-sm opacity-70">No links yet.</p>
            ) : (
              <LinkBlocks
                links={rest}
                theme={theme}
                hrefFor={(link) => `/api/r/${link.id}`}
              />
            )}
          </div>

          <div
            className={cn(
              "ob-panel mt-8 rounded-2xl p-4",
              glassy && "ob-panel-glass",
            )}
          >
            <p className="mb-2 text-center text-sm font-medium">
              Subscribe for updates
            </p>
            <LeadCapture username={profile.username} theme={theme} />
          </div>
        </main>

        <footer className="pb-8 text-center">
          <Link
            href="/"
            className="text-xs opacity-60 transition-opacity hover:opacity-100"
          >
            Made with OpenLinq — build your own, free
          </Link>
        </footer>
      </div>
    </div>
  );
}
