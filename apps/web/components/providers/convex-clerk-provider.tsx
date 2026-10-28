"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

export default function ConvexClientProvider({
  children,
  url,
}: {
  children: ReactNode;
  url: string;
}) {
  const [convex] = useState(() => new ConvexReactClient(url));
  const disposal = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (disposal.current) clearTimeout(disposal.current);
    return () => {
      // Strict Mode rehearses cleanup/setup with the same client. Dispose only
      // after a real unmount, so that rehearsal can cancel the pending close.
      disposal.current = setTimeout(() => void convex.close(), 0);
    };
  }, [convex]);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
