"use client";
import { useState } from "react";

interface HintProps {
  text: string;
  className?: string;
}

export function Hint({ text, className }: HintProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"relative inline-block " + (className || "")}>
      <button
        type="button"
        aria-label="Hint"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="h-6 w-6 text-xs rounded-full border flex items-center justify-center hover:bg-muted transition"
      >
        ?
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-3 text-[11px] leading-snug shadow-md z-50">
          {text}
        </div>
      )}
    </div>
  );
}
