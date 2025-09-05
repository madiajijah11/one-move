"use client";
import { SignUp, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const sp = useSearchParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const raw = sp.get("next") || undefined;
  let next = "/play";
  if (raw) {
    try {
      const dec = decodeURIComponent(raw);
      if (dec.startsWith("/") && !dec.startsWith("//")) next = dec;
    } catch {
      /* ignore */
    }
  }
  const signInUrl = `/sign-in?next=${encodeURIComponent(next)}`;
  useEffect(() => {
    if (isSignedIn) router.replace(next);
  }, [isSignedIn, next, router]);
  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2">
      <div className="order-2 md:order-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
              Create Account
            </h2>
            <p className="text-xs text-muted-foreground">
              Start your daily cognitive streak today.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                  footerAction__signIn: "text-sm",
                },
              }}
              signInUrl={signInUrl}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link className="underline" href={signInUrl}>
              Sign in
            </Link>
          </p>
          <p className="text-center text-[10px] text-muted-foreground/70">
            We only store basic play metrics—no ads, no spam.
          </p>
        </div>
      </div>
      <div className="hidden md:flex order-1 md:order-2 flex-col justify-center p-10 xl:p-12 bg-gradient-to-br from-primary/10 via-background to-background border-b md:border-b-0 md:border-l">
        <div className="max-w-sm space-y-6 md:ms-auto">
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight">
            OneMove
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Build a tiny daily learning loop: play → reflect → improve. Stay
            consistent and watch your streak grow.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 60‑second puzzles</li>
            <li>• Memory, logic, speed, focus</li>
            <li>• AI weekly encouragement</li>
            <li>• Clean, distraction‑free UI</li>
          </ul>
          <p className="text-[11px] text-muted-foreground/70">
            Prototype—features may shift rapidly.
          </p>
        </div>
      </div>
    </div>
  );
}
