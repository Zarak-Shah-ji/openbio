"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signup, type AuthState } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function signInWithOAuth(provider: "google" | "github") {
  const supabase = createClient();
  void supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
    },
  });
}

const oauthBtn =
  "flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border-2 border-foreground bg-card px-4 text-sm font-semibold shadow-hard transition-all hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <button
          type="button"
          className={oauthBtn}
          onClick={() => signInWithOAuth("google")}
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          type="button"
          className={oauthBtn}
          onClick={() => signInWithOAuth("github")}
        >
          <GitHubIcon />
          Continue with GitHub
        </button>
      </div>

      <div className="relative py-1 text-center">
        <div className="absolute inset-x-0 top-1/2 -z-0 border-t-2 border-foreground" />
        <span className="relative bg-card px-2 text-xs font-medium text-muted-foreground">
          or with email
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            placeholder="At least 8 characters"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.message && (
          <p className="text-sm text-emerald-600">{state.message}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending
            ? "Working…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A12 12 0 0 0 0 12.64a12 12 0 0 0 8.21 11.5c.6.11.82-.27.82-.58v-2.03c-3.34.74-4.04-1.64-4.04-1.64-.55-1.4-1.34-1.78-1.34-1.78-1.09-.76.08-.74.08-.74 1.2.09 1.84 1.26 1.84 1.26 1.07 1.86 2.81 1.32 3.5 1.01.1-.79.42-1.32.76-1.62-2.67-.31-5.47-1.36-5.47-6.05 0-1.34.46-2.43 1.22-3.29-.12-.31-.53-1.55.12-3.23 0 0 1-.33 3.3 1.26a11.3 11.3 0 0 1 6 0c2.28-1.59 3.29-1.26 3.29-1.26.65 1.68.24 2.92.12 3.23.76.86 1.22 1.95 1.22 3.29 0 4.7-2.81 5.74-5.49 6.04.43.38.81 1.12.81 2.26v3.35c0 .31.21.7.82.58A12 12 0 0 0 24 12.64 12 12 0 0 0 12 .5z" />
    </svg>
  );
}
