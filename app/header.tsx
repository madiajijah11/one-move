"use client";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-sm">
            OneMove
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
            <Link href="/play" className="hover:text-foreground transition">
              Play
            </Link>
            <Link href="/games" className="hover:text-foreground transition">
              Games
            </Link>
            <Link href="/" className="hover:text-foreground transition">
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {mounted && (
            <Button
              size="sm"
              variant="ghost"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </Button>
          )}
          <SignedOut>
            <SignInButton>
              <Button size="sm" variant="outline">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
