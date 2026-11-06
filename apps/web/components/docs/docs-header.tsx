"use client";

import { useEffect } from "react";
import { PanelLeft } from "lucide-react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { SidebarTrigger } from "fumadocs-ui/layouts/notebook/slots/sidebar";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  HeaderSection,
  SearchTriggerContent,
  searchTriggerClassName,
} from "@/components/landing/header-section";

function DocsSearchButton() {
  const { setOpenSearch } = useSearchContext();

  useEffect(() => {
    if (window.location.hash !== "#search") return;
    history.replaceState(null, "", window.location.pathname);
    setOpenSearch(true);
  }, [setOpenSearch]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={searchTriggerClassName}
      onClick={() => setOpenSearch(true)}
    >
      <SearchTriggerContent shortcut />
    </Button>
  );
}

export function DocsHeader() {
  return (
    <HeaderSection
      className="sticky top-(--fd-docs-row-1) [grid-area:header] layout:[--fd-header-height:--spacing(14)]"
      search={<DocsSearchButton />}
      menu={
        <SidebarTrigger
          aria-label="Open navigation"
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "md:hidden",
          })}
        >
          <PanelLeft aria-hidden="true" className="size-5" />
        </SidebarTrigger>
      }
    />
  );
}
