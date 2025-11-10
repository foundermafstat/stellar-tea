"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FiGithub, FiTwitter } from "react-icons/fi";

export const Footer = () => {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="border-t border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Stellar Tea</p>
          <p>Brewing galactic experiences since 2025.</p>
          <p className="text-xs text-muted-foreground/80">
            © {year} Stellar Tea Collective. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm md:flex-row md:items-center">
          <nav className="flex items-center gap-4 text-muted-foreground">
            <Link href="/terms" className="transition hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-foreground">
              Privacy
            </Link>
            <Link href="/support" className="transition hover:text-foreground">
              Support
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-lg text-muted-foreground">
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-foreground"
              aria-label="Twitter"
            >
              <FiTwitter />
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-foreground"
              aria-label="GitHub"
            >
              <FiGithub />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
