"use client";

import { useActionState } from "react";
import { claimUsername, type FormState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    claimUsername,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="flex items-center rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
          <span className="pl-3 text-sm text-muted-foreground">openlinq/</span>
          <Input
            id="username"
            name="username"
            required
            autoFocus
            placeholder="yourname"
            className="border-0 pl-1 focus-visible:ring-0"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers and underscores. 3–30 characters.
        </p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Claiming…" : "Claim username"}
      </Button>
    </form>
  );
}
