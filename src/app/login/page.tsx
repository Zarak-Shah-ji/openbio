import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Open<span className="text-primary">Bio</span>
          </Link>
          <CardTitle className="mt-2">Welcome back</CardTitle>
          <CardDescription>Sign in to manage your page.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <AuthForm mode="login" />
        </CardContent>
      </Card>
    </main>
  );
}
