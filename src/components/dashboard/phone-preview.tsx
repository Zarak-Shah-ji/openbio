import { Star } from "lucide-react";
import {
  buttonStyleProps,
  FONT_STACKS,
  pageBackgroundStyle,
  type Theme,
} from "@/lib/theme";

interface PreviewProfile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface PreviewLink {
  id: string;
  title: string;
  is_featured: boolean;
}

/** Phone-framed mock of the public page, used for live preview in the editor. */
export function PhonePreview({
  profile,
  links,
  theme,
}: {
  profile: PreviewProfile;
  links: PreviewLink[];
  theme: Theme;
}) {
  const name = profile.display_name || `@${profile.username}`;

  return (
    <div className="mx-auto w-[300px] overflow-hidden rounded-[2.2rem] border-[10px] border-slate-900 shadow-xl">
      <div
        className="h-[560px] overflow-y-auto px-5 py-8"
        style={{
          ...pageBackgroundStyle(theme),
          color: theme.textColor,
          fontFamily: FONT_STACKS[theme.font],
        }}
      >
        <div className="flex flex-col items-center text-center">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="size-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-black/20 text-2xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="mt-3 text-lg font-semibold">{name}</h2>
          {profile.bio && (
            <p className="mt-1 text-sm opacity-80">{profile.bio}</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {links.length === 0 ? (
            <p className="text-center text-sm opacity-60">
              Your links will appear here.
            </p>
          ) : (
            links.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium"
                style={buttonStyleProps(theme)}
              >
                {l.is_featured && <Star className="size-4 shrink-0" />}
                <span className="truncate">{l.title}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
