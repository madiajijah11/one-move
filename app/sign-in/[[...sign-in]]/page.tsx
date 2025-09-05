"use client";
import { SignIn, useUser } from "@clerk/nextjs";
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
  const signUpUrl = `/sign-up?next=${encodeURIComponent(next)}`;
  // Redirect signed-in users via effect (avoids render side-effects)
  useEffect(() => {
    if (isSignedIn) router.replace(next);
  }, [isSignedIn, next, router]);
  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center p-10 xl:p-12 bg-gradient-to-br from-primary/10 via-background to-background border-b md:border-b-0 md:border-r">
        <div className="max-w-sm space-y-6">
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight">
            OneMove
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A tiny daily brain game. Play once. Reflect briefly. Build an
            unbeatable streak and compound micro‑improvements.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Fresh mini‑puzzle each day</li>
            <li>• Track streak, score & focus metrics</li>
            <li>• Weekly AI coach summary</li>
            <li>• No overwhelm—60 seconds max</li>
          </ul>
          <p className="text-[11px] text-muted-foreground/70">
            By signing in you agree to our non-existent Terms (for now) – this
            is an early prototype.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-muted-foreground">
              Welcome back—unlock today&apos;s puzzle.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm w-max">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                  footerAction__signUp: "text-sm",
                },
              }}
              signUpUrl={signUpUrl}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            New here?{" "}
            <Link className="underline" href={signUpUrl}>
              Create an account
            </Link>
          </p>
          <p className="text-center text-[10px] text-muted-foreground/70">
            Problems? Email support@example.com
          </p>
        </div>
      </div>
    </div>
  );
}
