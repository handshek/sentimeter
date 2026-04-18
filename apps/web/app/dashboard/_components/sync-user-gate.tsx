"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Panel } from "./panel";

export function SyncUserGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
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

  if (error) {
    return (
      <Panel>
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
      </Panel>
    );
  }

  if (isLoading || !isAuthenticated || !synced) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <Panel>
        <LoadingSkeleton />
      </Panel>
    );
  }

  return <>{children}</>;
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
