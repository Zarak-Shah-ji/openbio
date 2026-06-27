import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getProfile, requireUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { DashboardNav } from "@/components/dashboard/nav";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b-2 border-foreground bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight"
            >
              Open<span className="bg-accent px-1 ring-2 ring-foreground">Linq</span>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border-2 border-foreground bg-card px-3 text-sm font-semibold shadow-hard-sm hover:bg-muted"
            >
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">@{profile.username}</span>
            </a>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
