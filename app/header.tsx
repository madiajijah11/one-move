"use client";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: "/play", label: "Play" },
  { href: "/games", label: "Games" },
  { href: "/", label: "Dashboard" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="font-semibold text-sm whitespace-nowrap">
            OneMove
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex md:hidden">
            <MobileMenu />
          </div>
          {mounted && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Toggle theme"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <span className="text-base leading-none">
                {theme === "dark" ? "🌞" : "🌙"}
              </span>
            </Button>
          )}
          <SignedOut>
            <SignInButton>
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:inline-flex"
              >
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

function MobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);
  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        aria-label="Toggle navigation"
        className="md:hidden"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "✕" : "☰"}
      </Button>
      {open && (
        <div className="absolute top-14 inset-x-0 px-4 pb-4 md:hidden animate-in fade-in slide-in-from-top-2">
          <nav className="rounded-lg border bg-background shadow-sm p-3 flex flex-col gap-2 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-2 py-1 rounded hover:bg-muted transition"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <SignedOut>
                <SignInButton>
                  <Button size="sm" variant="outline" className="w-full">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
