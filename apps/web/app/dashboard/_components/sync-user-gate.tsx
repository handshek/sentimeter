"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Panel } from "./panel";

export function SyncUserGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const syncUser = useMutation(api.users.syncUser);

  const [synced, setSynced] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (synced) return;
    if (error) return;

    let canceled = false;
    syncUser({})
      .then(() => {
        if (!canceled) setSynced(true);
      })
      .catch((err) => {
        if (!canceled) setError(err);
      });

    return () => {
      canceled = true;
    };
  }, [error, isAuthenticated, synced, syncUser]);

  const content = useMemo(() => {
    if (isLoading || !isAuthenticated || !synced) {
      return { kind: "panel" as const, node: <LoadingSkeleton /> };
    }

    if (error) {
      return {
        kind: "panel" as const,
        node: (
          <div className="space-y-3">
            <div className="text-sm font-semibold">Unable to load</div>
            <div className="text-sm text-muted-foreground">
              Please refresh the page or try again.
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setSynced(false);
              }}
            >
              Retry
            </Button>
          </div>
        ),
      };
    }

    return { kind: "children" as const, node: children };
  }, [children, error, isAuthenticated, isLoading, synced]);

  if (content.kind === "children") return <>{content.node}</>;
  return <Panel>{content.node}</Panel>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-5 w-44 animate-pulse rounded bg-muted" />
      <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      <div className="h-24 w-full animate-pulse rounded bg-muted/70" />
    </div>
  );
}
