import { ArrowUpRight, Play, Star } from "lucide-react";
import { autoPosterUrl, displayHost, youTubeId } from "@/lib/social";
import {
  buttonStyleProps,
  tileClassName,
  tileVars,
  type Theme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface BlockLink {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  is_featured: boolean;
}

/**
 * Renders the link list in whichever layout the theme selects.
 *
 * `hrefFor` is what separates the live page from the dashboard preview: the
 * page passes the click-tracking redirect, the preview omits it and the blocks
 * render as inert divs. Everything else — markup, classes, styles — is shared,
 * so the preview cannot drift from what visitors see.
 */
export function LinkBlocks({
  links,
  theme,
  hrefFor,
  compact = false,
}: {
  links: BlockLink[];
  theme: Theme;
  hrefFor?: (link: BlockLink) => string;
  compact?: boolean;
}) {
  // The caller owns the empty state: a page whose links are all socials has a
  // working glyph row, and "No links yet." underneath it would be a lie.
  if (links.length === 0) return null;

  const container =
    theme.linkLayout === "grid"
      ? "grid grid-cols-2 gap-3"
      : "flex flex-col gap-3";

  return (
    // Keyed on layout + motion so switching either in the editor remounts the
    // blocks and replays the entrance animation.
    <div
      key={`${theme.linkLayout}-${theme.motion}`}
      className={cn(container, theme.linkLayout === "cover" && "gap-4")}
    >
      {links.map((link, i) => (
        <Block
          key={link.id}
          link={link}
          index={i}
          theme={theme}
          href={hrefFor?.(link)}
          compact={compact}
        />
      ))}
    </div>
  );
}

function Block({
  link,
  index,
  theme,
  href,
  compact,
}: {
  link: BlockLink;
  index: number;
  theme: Theme;
  href?: string;
  compact: boolean;
}) {
  const media = theme.linkLayout === "cover" || theme.linkLayout === "grid";
  // `row` is the pre-existing layout, so it keeps showing only what the user
  // uploaded. Auto-filling a YouTube poster there would silently restyle every
  // legacy page — and would displace the featured star, which shares the slot.
  const poster =
    link.thumbnail_url ??
    (theme.linkLayout === "row" ? null : autoPosterUrl(link.url));
  const isVideo = youTubeId(link.url) !== null;

  const props = {
    className: cn(
      "group block",
      tileClassName(theme),
      media && "overflow-hidden",
      // A featured link is the page's headline, so it takes the full width
      // back from the two-column grid.
      theme.linkLayout === "grid" && link.is_featured && "col-span-2",
    ),
    style: { ...buttonStyleProps(theme), ...tileVars(index) },
  };

  const body = (
    <BlockBody
      link={link}
      theme={theme}
      poster={poster}
      isVideo={isVideo}
      compact={compact}
    />
  );

  return href ? (
    <a href={href} rel="noopener" {...props}>
      {body}
    </a>
  ) : (
    <div {...props}>{body}</div>
  );
}

function BlockBody({
  link,
  theme,
  poster,
  isVideo,
  compact,
}: {
  link: BlockLink;
  theme: Theme;
  poster: string | null;
  isVideo: boolean;
  compact: boolean;
}) {
  switch (theme.linkLayout) {
    case "card":
      return (
        <span className="flex items-center gap-3 p-2.5">
          <Thumb
            poster={poster}
            title={link.title}
            isVideo={isVideo}
            className="size-14 shrink-0 rounded-xl"
          />
          <span className="min-w-0 flex-1 text-left">
            <span
              className={cn(
                "line-clamp-2 font-semibold",
                compact ? "text-sm" : "text-base",
              )}
            >
              {link.title}
            </span>
            <span className="block truncate text-xs opacity-60">
              {displayHost(link.url)}
            </span>
          </span>
          {link.is_featured && <Star className="size-4 shrink-0 opacity-80" />}
          <ArrowUpRight className="size-4 shrink-0 opacity-40 transition-opacity group-hover:opacity-90" />
        </span>
      );

    case "cover":
      return (
        <span className="relative block">
          <Thumb
            poster={poster}
            title={link.title}
            isVideo={isVideo}
            className="aspect-video w-full"
          />
          <span className="ob-cover-caption">
            <span
              className={cn(
                "flex items-start gap-2 font-semibold",
                compact ? "text-sm" : "text-lg",
              )}
            >
              {link.is_featured && (
                <Star className="mt-0.5 size-4 shrink-0" />
              )}
              <span className="line-clamp-2">{link.title}</span>
            </span>
          </span>
        </span>
      );

    case "grid":
      return (
        <span className="block">
          <Thumb
            poster={poster}
            title={link.title}
            isVideo={isVideo}
            className={cn(
              "w-full",
              link.is_featured ? "aspect-video" : "aspect-square",
            )}
          />
          <span className="flex items-start gap-1.5 px-3 py-2.5 text-left">
            {link.is_featured && <Star className="mt-0.5 size-3.5 shrink-0" />}
            <span
              className={cn(
                "line-clamp-2 min-w-0 flex-1 font-medium",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {link.title}
            </span>
          </span>
        </span>
      );

    case "row":
    default:
      return (
        <span className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium">
          {/* Both slots are the same width so the title stays optically
              centred whether or not there is a thumbnail. */}
          <span
            className={cn(
              "flex shrink-0 items-center justify-center",
              poster ? "size-7" : "size-4",
            )}
          >
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt=""
                className="size-7 rounded-md object-cover"
              />
            ) : (
              link.is_featured && <Star className="size-4" />
            )}
          </span>
          <span className="flex-1 truncate text-center">{link.title}</span>
          <span
            className={cn(
              "flex shrink-0 items-center justify-center",
              poster ? "size-7" : "size-4",
            )}
          >
            <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-70" />
          </span>
        </span>
      );
  }
}

/**
 * Media for a block. Links with no image of their own fall back to a tinted
 * monogram built from the theme, so image layouts never collapse into empty
 * boxes.
 */
function Thumb({
  poster,
  title,
  isVideo,
  className,
}: {
  poster: string | null;
  title: string;
  isVideo: boolean;
  className?: string;
}) {
  return (
    <span className={cn("ob-thumb", className)}>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="ob-thumb-img" />
      ) : (
        <span className="ob-thumb-fallback">{title.charAt(0).toUpperCase()}</span>
      )}
      {isVideo && (
        <span className="ob-play">
          <Play className="size-1/2 translate-x-[6%] fill-current" />
        </span>
      )}
    </span>
  );
}
