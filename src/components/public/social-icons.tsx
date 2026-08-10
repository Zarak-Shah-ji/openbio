import type { SocialPlatform } from "@/lib/social";

/**
 * Monochrome glyphs for the social row.
 *
 * These are simplified, originally-drawn marks rather than the platforms'
 * official brand assets — recognisable at 20px, no licensing baggage, and they
 * inherit `currentColor` so they take on whatever the user's text colour is.
 * lucide-react dropped its brand icons, so there is nothing to import.
 */
const PATHS: Record<SocialPlatform, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <>
      <path d="M14 3v10.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.4 2.6 2 4.2 4.6 4.5" />
    </>
  ),
  x: (
    <>
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M14.6 8.2h-1.4c-.9 0-1.4.5-1.4 1.4v1.6h2.7l-.4 2.7h-2.3v5.5" />
      <path d="M9.4 11.2h2.4" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10.5v6" />
      <circle cx="7.5" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
      <path d="M11.5 16.5v-3.2a2 2 0 0 1 4 0v3.2" />
      <path d="M11.5 10.6v.9" />
    </>
  ),
  github: (
    <>
      <path d="M9 19c-4 1.2-4-2.2-5.6-2.7M15 21v-3.3a2.8 2.8 0 0 0-.8-2.2c2.6-.3 5.3-1.3 5.3-5.8a4.5 4.5 0 0 0-1.2-3.1 4.2 4.2 0 0 0-.1-3.1s-1-.3-3.3 1.2a11.4 11.4 0 0 0-6 0C6.6 3.2 5.6 3.5 5.6 3.5a4.2 4.2 0 0 0-.1 3.1A4.5 4.5 0 0 0 4.3 9.7c0 4.5 2.7 5.5 5.3 5.8a2.8 2.8 0 0 0-.8 2.2V21" />
    </>
  ),
  spotify: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M7.6 9.4c2.9-.8 6-.5 8.6.9" />
      <path d="M8.2 12.4c2.4-.6 4.9-.4 7 .8" />
      <path d="M8.9 15.3c1.9-.5 3.8-.3 5.5.6" />
    </>
  ),
  threads: (
    <>
      <path d="M16.5 7.4C15.4 5.9 13.9 5.2 12 5.2c-3.7 0-6 2.6-6 6.8s2.3 6.8 6 6.8c2.6 0 4.4-1.3 4.4-3.2 0-1.8-1.5-2.9-3.9-2.9-1.6 0-2.7.7-2.7 1.8 0 .9.7 1.5 1.8 1.5 1.5 0 2.4-1.1 2.4-3.1" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20.2 12a8.2 8.2 0 0 1-12.3 7.1L3.8 20.2l1.1-4.1A8.2 8.2 0 1 1 20.2 12z" />
      <path d="M9.2 9.1c.3 2.6 2.4 4.7 5 5 .6.1 1.1-.4 1.1-1v-.6l-1.7-.6-.8.8a5.6 5.6 0 0 1-2.2-2.2l.8-.8-.6-1.7h-.6c-.6 0-1.1.5-1 1.1z" />
    </>
  ),
  telegram: (
    <>
      <path d="M21 4.5L2.8 11.4l5 1.6L19 6.3l-8.4 8.3.3 5 2.6-3.4 4 2.9z" />
    </>
  ),
  discord: (
    <>
      <path d="M8.5 5.5A16 16 0 0 0 4 7.2C2.4 10 2 13.3 2.4 16.5a15 15 0 0 0 4.4 2l1-1.6" />
      <path d="M15.5 5.5A16 16 0 0 1 20 7.2c1.6 2.8 2 6.1 1.6 9.3a15 15 0 0 1-4.4 2l-1-1.6" />
      <path d="M7.5 16.4a13 13 0 0 0 9 0" />
      <circle cx="9.3" cy="12.2" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="12.2" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  twitch: (
    <>
      <path d="M4 3h16v11l-4 4h-3l-3 3H8v-3H4z" />
      <path d="M11 8v4M15 8v4" />
    </>
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M10 20l1.6-6.4" />
      <path d="M8.9 11.2c0-2.1 1.6-3.6 3.6-3.6 2 0 3.3 1.2 3.3 3 0 2.2-1.2 3.9-2.9 3.9-.9 0-1.6-.7-1.4-1.6" />
    </>
  ),
  reddit: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <circle cx="19.6" cy="6.6" r="1.7" />
      <path d="M13.4 6.2l.9-3.1 3.6.9" />
      <circle cx="9.4" cy="12.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.6" cy="12.6" r="1" fill="currentColor" stroke="none" />
      <path d="M9.4 15.9a4.4 4.4 0 0 0 5.2 0" />
    </>
  ),
  email: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M3.5 7.5l8.5 6 8.5-6" />
    </>
  ),
};

export function SocialIcon({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[platform]}
    </svg>
  );
}
