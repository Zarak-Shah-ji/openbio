import { SOCIAL_LABELS, type SocialPlatform } from "@/lib/social";
import { SocialIcon } from "@/components/public/social-icons";

export interface SocialItem<T> {
  link: T;
  platform: SocialPlatform;
}

/**
 * Compact row of platform glyphs, shown under the identity block.
 *
 * These links are deliberately *not* repeated as full blocks — a page that
 * spends four full-width buttons on "Instagram / TikTok / X / YouTube" buries
 * whatever the visitor actually came for.
 */
export function SocialRow<T extends { id: string }>({
  items,
  hrefFor,
}: {
  items: SocialItem<T>[];
  hrefFor?: (link: T) => string;
}) {
  if (items.length === 0) return null;

  return (
    <nav className="mt-4 flex flex-wrap items-center justify-center gap-1">
      {items.map(({ link, platform }) => {
        const label = SOCIAL_LABELS[platform];
        const icon = <SocialIcon platform={platform} className="size-5" />;
        const className =
          "ob-social flex size-10 items-center justify-center rounded-full";

        return hrefFor ? (
          <a
            key={link.id}
            href={hrefFor(link)}
            rel="noopener"
            aria-label={label}
            title={label}
            className={className}
          >
            {icon}
          </a>
        ) : (
          <span key={link.id} aria-label={label} className={className}>
            {icon}
          </span>
        );
      })}
    </nav>
  );
}
