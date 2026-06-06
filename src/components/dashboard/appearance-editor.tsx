"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { saveTheme } from "@/app/dashboard/actions";
import { PhonePreview } from "@/components/dashboard/phone-preview";
import {
  THEME_PRESETS,
  type ButtonStyle,
  type FontFamily,
  type Theme,
} from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

const BUTTON_STYLES: { value: ButtonStyle; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
  { value: "outline", label: "Outline" },
  { value: "shadow", label: "Shadow" },
];

const FONTS: { value: FontFamily; label: string }[] = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
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

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">Presets</h2>
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setTheme(p.theme);
                  setSaved(false);
                }}
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
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">Background</h2>
          <Segmented
            options={[
              { value: "gradient", label: "Gradient" },
              { value: "solid", label: "Solid" },
            ]}
            value={theme.background}
            onChange={(v) => set("background", v)}
          />
          <ColorField
            label="Background color"
            value={theme.bgColor}
            onChange={(v) => set("bgColor", v)}
          />
          {theme.background === "gradient" && (
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
          <h2 className="font-semibold">Buttons</h2>
          <Segmented
            options={BUTTON_STYLES}
            value={theme.buttonStyle}
            onChange={(v) => set("buttonStyle", v)}
          />
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
  );
}
