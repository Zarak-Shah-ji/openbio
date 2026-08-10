"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, Sparkles, Upload, X } from "lucide-react";
import { saveTheme } from "@/app/dashboard/actions";
import { PhonePreview } from "@/components/dashboard/phone-preview";
import { uploadMedia } from "@/lib/upload";
import {
  THEME_PRESETS,
  type AvatarShape,
  type BackgroundStyle,
  type ButtonStyle,
  type Effect,
  type FontFamily,
  type HeaderStyle,
  type LinkLayout,
  type Motion,
  type Surface,
  type Theme,
} from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PreviewProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}
interface PreviewLink {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  is_featured: boolean;
}

const HEADERS: { value: HeaderStyle; label: string; hint: string }[] = [
  { value: "classic", label: "Classic", hint: "Small round avatar, centred" },
  {
    value: "hero",
    label: "Hero",
    hint: "Big photo that dissolves into the page",
  },
  { value: "banner", label: "Banner", hint: "Photo band with avatar on the seam" },
  {
    value: "immersive",
    label: "Immersive",
    hint: "Name and bio set over the photo",
  },
];

const LINK_LAYOUTS: { value: LinkLayout; label: string; hint: string }[] = [
  { value: "row", label: "Row", hint: "Slim button, centred title" },
  { value: "card", label: "Card", hint: "Thumbnail, title and site" },
  { value: "cover", label: "Cover", hint: "Wide image, title over it" },
  { value: "grid", label: "Grid", hint: "Two-up image tiles" },
];

const BACKGROUNDS: { value: BackgroundStyle; label: string }[] = [
  { value: "gradient", label: "Gradient" },
  { value: "solid", label: "Solid" },
  { value: "image", label: "Photo" },
];

const SURFACES: { value: Surface; label: string; hint: string }[] = [
  { value: "flat", label: "Flat", hint: "Classic solid buttons" },
  { value: "glass", label: "Glass", hint: "Frosted, blurs what's behind" },
  { value: "neon", label: "Neon", hint: "Glowing accent outline" },
  { value: "holo", label: "Holo", hint: "Iridescent shifting border" },
  { value: "chrome", label: "Chrome", hint: "Polished liquid metal" },
];

const EFFECTS: { value: Effect; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "Just the background" },
  { value: "aurora", label: "Aurora", hint: "Drifting colour clouds" },
  { value: "mesh", label: "Mesh", hint: "Breathing gradient blooms" },
  { value: "grid", label: "Grid", hint: "Retro perspective floor" },
  { value: "orbs", label: "Orbs", hint: "Bokeh rising slowly" },
  { value: "scanlines", label: "Scanlines", hint: "CRT texture and sweep" },
  { value: "starfield", label: "Starfield", hint: "Twinkling deep space" },
];

const MOTIONS: { value: Motion; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "Everything static" },
  { value: "rise", label: "Rise", hint: "Links slide up in sequence" },
  { value: "float", label: "Float", hint: "Rise, then gently hover" },
  { value: "pop", label: "Pop", hint: "Springy scale-in" },
];

const AVATAR_SHAPES: { value: AvatarShape; label: string }[] = [
  { value: "circle", label: "Circle" },
  { value: "squircle", label: "Squircle" },
  { value: "hex", label: "Hex" },
  { value: "blob", label: "Blob" },
];

const BUTTON_STYLES: { value: ButtonStyle; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
  { value: "outline", label: "Outline" },
  { value: "shadow", label: "Shadow" },
  { value: "hardshadow", label: "Hard shadow" },
  { value: "soft", label: "Soft" },
  { value: "underline", label: "Underline" },
];

const FONTS: { value: FontFamily; label: string }[] = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
  { value: "display", label: "Display" },
  { value: "rounded", label: "Rounded" },
  { value: "slab", label: "Slab" },
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 cursor-pointer rounded border border-border bg-transparent"
          aria-label={label}
        />
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-[var(--primary)]"
      />
    </div>
  );
}

function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            value === o.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Segmented control with a supporting line of copy under each choice. */
function OptionGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; hint: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg border px-3 py-2 text-left transition-colors",
            value === o.value
              ? "border-primary bg-primary/10"
              : "border-border hover:bg-muted",
          )}
        >
          <span
            className={cn(
              "block text-sm font-semibold",
              value === o.value && "text-primary",
            )}
          >
            {o.label}
          </span>
          <span className="block text-xs text-muted-foreground">{o.hint}</span>
        </button>
      ))}
    </div>
  );
}

export function AppearanceEditor({
  initialTheme,
  profile,
  links,
}: {
  initialTheme: Theme;
  profile: PreviewProfile;
  links: PreviewLink[];
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  type UploadKind = "bg" | "cover";
  const [uploading, setUploading] = useState<UploadKind | null>(null);
  // Kept with the slot it belongs to, so a failed cover upload reports itself
  // in the Header card rather than in whichever card happens to be open.
  const [uploadError, setUploadError] = useState<{
    kind: UploadKind;
    message: string;
  } | null>(null);

  function set<K extends keyof Theme>(key: K, value: Theme[K]) {
    setTheme((t) => ({ ...t, [key]: value }));
    setSaved(false);
  }

  function onSave() {
    startTransition(async () => {
      await saveTheme(theme);
      setSaved(true);
    });
  }

  async function onBackgroundFile(file: File) {
    setUploadError(null);
    setUploading("bg");
    try {
      const url = await uploadMedia(profile.id, file, "bg");
      // Uploading a photo is an implicit request to show it, and a photo with
      // no dim behind light text is the most common way to end up unreadable.
      setTheme((t) => ({
        ...t,
        bgImageUrl: url,
        background: "image",
        bgDim: t.bgDim === 0 ? 35 : t.bgDim,
      }));
      setSaved(false);
    } catch (e) {
      setUploadError({
        kind: "bg",
        message: e instanceof Error ? e.message : "Upload failed",
      });
    } finally {
      setUploading(null);
    }
  }

  async function onCoverFile(file: File) {
    setUploadError(null);
    setUploading("cover");
    try {
      const url = await uploadMedia(profile.id, file, "cover");
      // A cover only means anything with a full-bleed header, so switch to one
      // rather than uploading into an invisible slot.
      setTheme((t) => ({
        ...t,
        coverImageUrl: url,
        header: t.header === "classic" ? "hero" : t.header,
      }));
      setSaved(false);
    } catch (e) {
      setUploadError({
        kind: "cover",
        message: e instanceof Error ? e.message : "Upload failed",
      });
    } finally {
      setUploading(null);
    }
  }

  /** Applies a preset without throwing away photos the user uploaded. */
  function applyPreset(preset: Theme) {
    setTheme({
      ...preset,
      bgImageUrl: theme.bgImageUrl,
      background: theme.bgImageUrl ? "image" : preset.background,
      bgBlur: theme.bgBlur,
      bgZoom: theme.bgZoom,
      bgDim: theme.bgDim,
      coverImageUrl: theme.coverImageUrl,
    });
    setSaved(false);
  }

  const showcase = THEME_PRESETS.filter((p) => p.showcase);
  const classics = THEME_PRESETS.filter((p) => !p.showcase);

  return (
    <div className="space-y-6">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setShowPreview((s) => !s)}
          className="flex w-full items-center justify-between rounded-lg border-2 border-foreground bg-card px-4 py-2.5 text-sm font-semibold shadow-hard-sm"
        >
          {showPreview ? "Hide live preview" : "Show live preview"}
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              showPreview && "rotate-180",
            )}
          />
        </button>
        {showPreview && (
          <div className="mt-4 flex justify-center">
            <PhonePreview profile={profile} links={links} theme={theme} />
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="font-semibold">Signature looks</h2>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              Full scenes — background, atmosphere, material and motion in one
              tap.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {showcase.map((p) => (
                <PresetTile
                  key={p.name}
                  name={p.name}
                  theme={p.theme}
                  active={p.theme.effect === theme.effect &&
                    p.theme.surface === theme.surface &&
                    p.theme.bgColor === theme.bgColor}
                  onSelect={() => applyPreset(p.theme)}
                />
              ))}
            </div>

            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                Classic colour presets
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {classics.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.theme)}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <span
                      className="size-5 rounded-full border border-black/10"
                      style={{
                        background:
                          p.theme.background === "gradient"
                            ? `linear-gradient(135deg, ${p.theme.bgColor}, ${p.theme.bgColorSecondary})`
                            : p.theme.bgColor,
                      }}
                    />
                    {p.name}
                  </button>
                ))}
              </div>
            </details>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h2 className="font-semibold">Header</h2>
              <p className="text-xs text-muted-foreground">
                The first thing anyone sees. The photo runs edge to edge and
                melts into the page — no frame, no seam.
              </p>
            </div>
            <OptionGrid
              options={HEADERS}
              value={theme.header}
              onChange={(v) => set("header", v)}
            />

            {theme.header !== "classic" && (
              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  {theme.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={theme.coverImageUrl}
                      alt=""
                      className="h-16 w-28 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                      <Upload className="size-5" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
                      {uploading === "cover"
                        ? "Uploading…"
                        : theme.coverImageUrl
                          ? "Replace cover"
                          : "Upload cover"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void onCoverFile(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {theme.coverImageUrl ? (
                      <button
                        type="button"
                        onClick={() => set("coverImageUrl", null)}
                        className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" /> Remove
                      </button>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Falls back to your profile photo.
                      </p>
                    )}
                    {uploadError?.kind === "cover" && (
                      <p className="text-xs text-red-600">
                        {uploadError.message}
                      </p>
                    )}
                  </div>
                </div>

                <SliderField
                  label="Height"
                  value={theme.heroHeight}
                  min={20}
                  max={75}
                  suffix="% of screen"
                  onChange={(v) => set("heroHeight", v)}
                />
                <SliderField
                  label="Blend into page"
                  value={100 - theme.heroFade}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(v) => set("heroFade", 100 - v)}
                />
                <SliderField
                  label="Darken"
                  value={theme.heroDim}
                  min={0}
                  max={90}
                  suffix="%"
                  onChange={(v) => set("heroDim", v)}
                />
              </div>
            )}
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-semibold">Background</h2>
            <Segmented
              options={BACKGROUNDS}
              value={theme.background}
              onChange={(v) => set("background", v)}
            />

            {theme.background === "image" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {theme.bgImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={theme.bgImageUrl}
                      alt=""
                      className="size-16 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                      <Upload className="size-5" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
                      {uploading === "bg"
                        ? "Uploading…"
                        : theme.bgImageUrl
                          ? "Replace photo"
                          : "Upload photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void onBackgroundFile(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {theme.bgImageUrl && (
                      <button
                        type="button"
                        onClick={() => set("bgImageUrl", null)}
                        className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" /> Remove
                      </button>
                    )}
                    {uploadError?.kind === "bg" && (
                      <p className="text-xs text-red-600">
                        {uploadError.message}
                      </p>
                    )}
                  </div>
                </div>

                <SliderField
                  label="Blur"
                  value={theme.bgBlur}
                  min={0}
                  max={60}
                  suffix="px"
                  onChange={(v) => set("bgBlur", v)}
                />
                <SliderField
                  label="Zoom"
                  value={theme.bgZoom}
                  min={100}
                  max={250}
                  suffix="%"
                  onChange={(v) => set("bgZoom", v)}
                />
                <SliderField
                  label="Darken"
                  value={theme.bgDim}
                  min={0}
                  max={95}
                  suffix="%"
                  onChange={(v) => set("bgDim", v)}
                />
                <p className="text-xs text-muted-foreground">
                  The colours below still paint underneath the photo — they show
                  through while it loads.
                </p>
              </div>
            ) : null}

            <ColorField
              label="Background color"
              value={theme.bgColor}
              onChange={(v) => set("bgColor", v)}
            />
            {theme.background !== "solid" && (
              <ColorField
                label="Gradient second color"
                value={theme.bgColorSecondary}
                onChange={(v) => set("bgColorSecondary", v)}
              />
            )}
            <ColorField
              label="Text color"
              value={theme.textColor}
              onChange={(v) => set("textColor", v)}
            />
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h2 className="font-semibold">Atmosphere</h2>
              <p className="text-xs text-muted-foreground">
                A living layer between your background and your links.
              </p>
            </div>
            <OptionGrid
              options={EFFECTS}
              value={theme.effect}
              onChange={(v) => set("effect", v)}
            />
            <ColorField
              label="Accent color"
              value={theme.accentColor}
              onChange={(v) => set("accentColor", v)}
            />
            <p className="-mt-2 text-xs text-muted-foreground">
              Drives the atmosphere, the neon glow and the avatar ring.
            </p>
            <ToggleField
              label="Film grain"
              hint="Fine analogue noise over everything"
              checked={theme.grain}
              onChange={(v) => set("grain", v)}
            />
            <ToggleField
              label="Vignette"
              hint="Darkens the edges to focus the centre"
              checked={theme.vignette}
              onChange={(v) => set("vignette", v)}
            />
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h2 className="font-semibold">Link blocks</h2>
              <p className="text-xs text-muted-foreground">
                How each link is presented. Card, cover and grid use the
                thumbnail you set on the link in Links.
              </p>
            </div>
            <OptionGrid
              options={LINK_LAYOUTS}
              value={theme.linkLayout}
              onChange={(v) => set("linkLayout", v)}
            />
            <p className="-mt-2 text-xs text-muted-foreground">
              A featured link takes the full width in Grid. YouTube links get
              their poster and a play badge automatically — no upload needed.
            </p>
            <ToggleField
              label="Social icon row"
              hint="Instagram, TikTok, X, YouTube and friends become glyphs under your bio instead of full buttons"
              checked={theme.socialRow}
              onChange={(v) => set("socialRow", v)}
            />
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h2 className="font-semibold">Link material</h2>
              <p className="text-xs text-muted-foreground">
                What your buttons are made of.
              </p>
            </div>
            <OptionGrid
              options={SURFACES}
              value={theme.surface}
              onChange={(v) => set("surface", v)}
            />

            <div className="space-y-3 border-t border-border pt-4">
              <Label className="text-sm">Shape</Label>
              <Segmented
                options={BUTTON_STYLES}
                value={theme.buttonStyle}
                onChange={(v) => set("buttonStyle", v)}
              />
            </div>

            <ColorField
              label="Button color"
              value={theme.buttonColor}
              onChange={(v) => set("buttonColor", v)}
            />
            <ColorField
              label="Button text color"
              value={theme.buttonTextColor}
              onChange={(v) => set("buttonTextColor", v)}
            />
            {theme.surface !== "flat" && (
              <p className="-mt-2 text-xs text-muted-foreground">
                {theme.surface === "chrome"
                  ? "Button color tints the metal; button text color is the label."
                  : "This material is translucent, so labels use your text color and the button color tints the glass."}
              </p>
            )}
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-semibold">Motion</h2>
            <OptionGrid
              options={MOTIONS}
              value={theme.motion}
              onChange={(v) => set("motion", v)}
            />
            <p className="text-xs text-muted-foreground">
              Visitors who ask their device for reduced motion always get the
              static version.
            </p>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-semibold">Avatar</h2>
            <Segmented
              options={AVATAR_SHAPES}
              value={theme.avatarShape}
              onChange={(v) => set("avatarShape", v)}
            />
            <ToggleField
              label="Glow ring"
              hint="Rotating accent halo around your photo"
              checked={theme.avatarRing}
              onChange={(v) => set("avatarRing", v)}
            />
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-semibold">Font</h2>
            <Segmented
              options={FONTS}
              value={theme.font}
              onChange={(v) => set("font", v)}
            />
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={onSave} disabled={pending}>
              {pending ? "Saving…" : "Save appearance"}
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                <Check className="size-4" /> Saved
              </span>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-8">
            <PhonePreview profile={profile} links={links} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Live thumbnail of a preset — the real background plus a sample tile. */
function PresetTile({
  name,
  theme,
  active,
  onSelect,
}: {
  name: string;
  theme: Theme;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "overflow-hidden rounded-lg border-2 text-left transition-colors",
        active ? "border-primary" : "border-border hover:border-primary/50",
      )}
    >
      <span
        className="flex h-16 items-end p-2"
        style={{
          background:
            theme.background === "solid"
              ? theme.bgColor
              : `linear-gradient(150deg, ${theme.bgColor}, ${theme.bgColorSecondary})`,
        }}
      >
        <span
          className="h-3 w-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${theme.accentColor}, ${theme.buttonColor})`,
            opacity: 0.9,
          }}
        />
      </span>
      <span className="block bg-card px-2 py-1.5 text-xs font-semibold">
        {name}
      </span>
    </button>
  );
}
