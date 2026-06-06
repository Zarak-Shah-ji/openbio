import Link from "next/link";
import {
  BarChart3,
  Palette,
  CalendarClock,
  Mail,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Full analytics",
    desc: "Lifetime views, clicks, click-through rate and a 30-day trend — the stuff other tools charge for.",
  },
  {
    icon: Palette,
    title: "Custom themes",
    desc: "Colors, gradients, fonts and button styles. No forced logo, no upsell badge.",
  },
  {
    icon: CalendarClock,
    title: "Scheduled links",
    desc: "Set a start and end time and links appear or disappear on their own.",
  },
  {
    icon: Mail,
    title: "Lead capture",
    desc: "Collect emails from your visitors and export them to CSV anytime.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-lg font-bold tracking-tight">
          Open<span className="text-primary">Bio</span>
        </span>
        <nav className="flex items-center gap-2">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Open-source link-in-bio
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          One link for everything.{" "}
          <span className="text-primary">Premium features, free.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          OpenBio gives you analytics, custom themes, scheduled links and lead
          capture — the features other link-in-bio tools lock behind a
          subscription — with no paywall.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            {user ? "Go to your dashboard" : "Build your page"}
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-lg border border-border bg-card px-6 text-sm font-medium hover:bg-muted"
          >
            Try the demo
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-5 px-6 pb-24 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>
            Open<span className="text-primary">Bio</span> — free &amp;
            open-source.
          </span>
          <span>
            An independent project, not affiliated with any other service.
          </span>
        </div>
      </footer>
    </main>
  );
}
