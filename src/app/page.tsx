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

const cta =
  "inline-flex h-12 items-center justify-center rounded-lg border-2 border-foreground px-6 font-semibold shadow-hard transition-all hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Open<span className="bg-accent px-1 ring-2 ring-foreground">Linq</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link href="/dashboard" className={`${cta} bg-primary text-primary-foreground`}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2 text-sm font-semibold hover:underline sm:px-3"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={`${cta} h-10 bg-primary px-4 text-sm text-primary-foreground`}
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-16 text-center sm:px-6 sm:py-24">
        <span className="font-mono-accent mb-6 inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-semibold shadow-hard-sm">
          <Sparkles className="size-3.5" />
          OPEN-SOURCE LINK-IN-BIO
        </span>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          One link for everything.{" "}
          <span className="mt-2 inline-block -rotate-1 border-2 border-foreground bg-accent px-3 shadow-hard">
            Premium, free.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          OpenLinq gives you analytics, custom themes, scheduled links and lead
          capture — the features other link-in-bio tools lock behind a
          subscription — with no paywall.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={user ? "/dashboard" : "/signup"}
            className={`${cta} bg-primary text-primary-foreground`}
          >
            {user ? "Go to your dashboard" : "Build your page"}
          </Link>
          <Link href="/login" className={`${cta} bg-card`}>
            Try the demo
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-5 px-5 pb-24 sm:grid-cols-2 sm:px-6">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border-2 border-foreground bg-card p-6 shadow-hard"
          >
            <div className="mb-3 inline-flex size-11 items-center justify-center rounded-lg border-2 border-foreground bg-accent">
              <Icon className="size-5" />
            </div>
            <h3 className="font-display text-lg font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="mt-auto border-t-2 border-foreground bg-card">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <span>
            Open<span className="font-semibold text-foreground">Bio</span> — free
            &amp; open-source.
          </span>
          <span>
            An independent project, not affiliated with any other service.
          </span>
        </div>
      </footer>
    </main>
  );
}
