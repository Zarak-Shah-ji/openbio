import { Backdrop } from "@/components/public/backdrop";
import { Hero, Identity } from "@/components/public/hero";
import { LinkBlocks, type BlockLink } from "@/components/public/link-blocks";
import { SocialRow } from "@/components/public/social-row";
import { partitionSocials } from "@/lib/social";
import {
  FONT_STACKS,
  hasHeroHeader,
  pageBackgroundStyle,
  themeVars,
  viewportUnitStyle,
  type Theme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

interface PreviewProfile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const FRAME_HEIGHT = 560;

/**
 * Phone-framed mock of the public page.
 *
 * It renders the same Backdrop, Hero, SocialRow and LinkBlocks as
 * `app/[username]/page.tsx` — only the click-tracking hrefs are dropped. The
 * preview is the real page at 300px wide, not a lookalike that can drift.
 */
export function PhonePreview({
  profile,
  links,
  theme,
}: {
  profile: PreviewProfile;
  links: BlockLink[];
  theme: Theme;
}) {
  const { socials, rest } = partitionSocials(links, theme.socialRow);

  return (
    <div className="mx-auto w-[300px] overflow-hidden rounded-[2.2rem] border-[10px] border-slate-900 shadow-xl">
      <div
        className="ob-page ob-page-framed"
        style={{
          ...pageBackgroundStyle(theme),
          ...themeVars(theme),
          // "40% of the screen" has to mean 40% of the phone frame here, not
          // 40% of the browser window the dashboard happens to be in.
          ...viewportUnitStyle(`${FRAME_HEIGHT / 100}px`),
          color: theme.textColor,
          fontFamily: FONT_STACKS[theme.font],
          height: FRAME_HEIGHT,
        }}
      >
        <Backdrop theme={theme} />

        {/* Content scrolls over a backdrop pinned to the phone frame. */}
        <div className="ob-content flex h-full flex-col overflow-y-auto">
          {hasHeroHeader(theme) && (
            <Hero theme={theme} profile={profile} compact />
          )}

          <div
            className={cn(
              "flex-1 px-5 pb-8",
              theme.header === "classic" && "pt-8",
              theme.header === "hero" && "pt-4",
              theme.header === "immersive" && "pt-6",
              theme.header === "banner" && "ob-below-banner",
            )}
          >
            {theme.header === "classic" && (
              <Hero theme={theme} profile={profile} compact />
            )}
            {(theme.header === "hero" || theme.header === "banner") && (
              <Identity profile={profile} compact />
            )}

            <SocialRow items={socials} />

            <div className="mt-6">
              {links.length === 0 ? (
                <p className="text-center text-sm opacity-60">
                  Your links will appear here.
                </p>
              ) : (
                <LinkBlocks links={rest} theme={theme} compact />
              )}
            </div>

            <div
              className={cn(
                "ob-panel mt-6 rounded-2xl p-3 text-center text-xs opacity-90",
                theme.surface !== "flat" && "ob-panel-glass",
              )}
            >
              Subscribe for updates
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
