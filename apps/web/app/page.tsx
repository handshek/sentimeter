"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  IconArrowRight,
  IconBrandGithub,
  IconLayoutDashboard,
  IconLogin,
} from "@tabler/icons-react";
import { UserButton, useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <header className="px-6 h-16 flex items-center justify-between border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-bold tracking-tight">Sentimeter</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="https://github.com/handshek/sentimeter">
              <IconBrandGithub className="w-4 h-4 mr-2" />
              GitHub
            </Link>
          </Button>

          {/* Signed-out: show Sign In button */}
          {!isSignedIn && (
            <Button asChild>
              <Link href="/sign-in">
                <IconLogin className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
          )}

          {/* Signed-in: show Dashboard link + avatar */}
          {isSignedIn && (
            <>
              <Button asChild variant="default">
                <Link href="/dashboard">
                  <IconLayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <UserButton />
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center max-w-5xl mx-auto">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now in beta
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent leading-[1.1]">
            Developer-first <br className="hidden sm:block" />
            feedback collection.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Embed open-code React components via shadcn, collect instant
            reactions, and see real-time analytics on a sleek dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* CTA changes depending on auth state */}
            {!isSignedIn ? (
              <Button size="lg" asChild className="h-12 px-8 text-base">
                <Link href="/sign-in">
                  Get Started
                  <IconArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="h-12 px-8 text-base">
                <Link href="/dashboard">
                  Go to Dashboard
                  <IconArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 px-8 text-base"
            >
              <Link href="https://github.com/handshek/sentimeter">
                <IconBrandGithub className="mr-2 w-4 h-4" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 w-full max-w-4xl mx-auto aspect-video rounded-xl border border-border/50 bg-muted/30 flex items-center justify-center text-muted-foreground animate-in fade-in zoom-in duration-1000 delay-300">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-background border border-border shadow-sm">
              <IconArrowRight className="w-6 h-6 rotate-45 text-primary" />
            </div>
            <p className="text-sm font-medium">Dashboard preview coming soon</p>
          </div>
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-border/40 text-center text-sm text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Sentimeter. Built for developers.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
