import {
  avatarShapeClass,
  heroDimStyle,
  heroImageUrl,
  heroMaskStyle,
  heroStyle,
  type Theme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface HeroProfile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

/** True when the header paints the name/bio itself, so the page must not repeat them. */
export function headerOwnsIdentity(theme: Theme): boolean {
  return theme.header === "immersive";
}

function displayName(profile: HeroProfile) {
  return profile.display_name || `@${profile.username}`;
}

/**
 * The top of the page.
 *
 * Everything except `classic` is full-bleed: the photo runs edge to edge and
 * dissolves into the page background through a mask, so there is no seam
 * between the image and the theme below it.
 */
export function Hero({
  theme,
  profile,
  compact = false,
}: {
  theme: Theme;
  profile: HeroProfile;
  /** Tighter type scale, for the dashboard's phone-sized preview. */
  compact?: boolean;
}) {
  const name = displayName(profile);

  if (theme.header === "classic") {
    return <ClassicHeader theme={theme} profile={profile} compact={compact} />;
  }

  const image = heroImageUrl(theme, profile.avatar_url);

  return (
    <header
      className={cn("ob-hero", `ob-hero-${theme.header}`)}
      style={heroStyle(theme)}
    >
      <div className="ob-hero-media" style={heroMaskStyle(theme)}>
        {image ? (
          <>
            {/* A wide screen turns the hero into a letterbox strip, and
                `cover` would zoom a portrait photo until only a slice of the
                subject fits. The sharp copy therefore keeps a phone-shaped
                crop box, and a blurred copy of the same file fills the space
                either side of it — same image, so there is no seam to see. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" aria-hidden className="ob-hero-blur" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="ob-hero-img" />
          </>
        ) : (
          <div className="ob-hero-fallback" />
        )}
        {theme.heroDim > 0 && (
          <div className="ob-hero-scrim" style={heroDimStyle(theme)} />
        )}
      </div>

      {theme.header === "immersive" && (
        <div className="ob-hero-caption">
          <h1
            className={cn(
              "font-semibold tracking-tight drop-shadow",
              compact ? "text-xl" : "text-3xl",
            )}
          >
            {name}
          </h1>
          {profile.bio && (
            <p
              className={cn(
                "mt-1 opacity-90 drop-shadow",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {profile.bio}
            </p>
          )}
        </div>
      )}

      {theme.header === "banner" && (
        <div className="ob-hero-avatar">
          <Avatar theme={theme} profile={profile} compact={compact} ring />
        </div>
      )}
    </header>
  );
}

/**
 * Name and bio on their own, for the headers that put the photo full-bleed
 * above the content column instead of carrying the text themselves.
 */
export function Identity({
  profile,
  compact = false,
}: {
  profile: HeroProfile;
  compact?: boolean;
}) {
  return (
    <div className="text-center">
      <h1
        className={cn(
          "font-semibold tracking-tight",
          compact ? "text-lg" : "text-2xl",
        )}
      >
        {displayName(profile)}
      </h1>
      {profile.bio && (
        <p
          className={cn(
            "mx-auto mt-1.5 max-w-xs opacity-80",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {profile.bio}
        </p>
      )}
    </div>
  );
}

function ClassicHeader({
  theme,
  profile,
  compact,
}: {
  theme: Theme;
  profile: HeroProfile;
  compact: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <Avatar theme={theme} profile={profile} compact={compact} />
      <div className="mt-4">
        <Identity profile={profile} compact={compact} />
      </div>
    </div>
  );
}

function Avatar({
  theme,
  profile,
  compact,
  ring,
}: {
  theme: Theme;
  profile: HeroProfile;
  compact: boolean;
  /** Banner avatars always get a rim so they read against the photo behind. */
  ring?: boolean;
}) {
  const shape = avatarShapeClass(theme);
  const size = compact ? "size-20" : "size-24";
  const name = displayName(profile);

  return (
    <div
      className={cn(
        "ob-avatar",
        (theme.avatarRing || ring) && "ob-avatar-ring",
        shape,
      )}
    >
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={name}
          className={cn(size, "object-cover shadow-lg", shape)}
        />
      ) : (
        <div
          className={cn(
            size,
            "flex items-center justify-center bg-black/25 font-bold shadow-lg",
            compact ? "text-2xl" : "text-3xl",
            shape,
          )}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
