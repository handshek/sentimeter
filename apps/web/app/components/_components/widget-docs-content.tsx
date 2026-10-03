"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  getCompoundSnippet,
  getUsageSnippet,
  type WidgetDemoOptions,
  type WidgetDocConfig,
} from "../../_lib/widget-catalog";
import { WidgetInstallCommand } from "./widget-install-command";
import { WidgetDemo } from "./widget-demo";
import { CodeBlock } from "./code-block";

export function WidgetDocsContent({ widget }: { widget: WidgetDocConfig }) {
  const defaults: WidgetDemoOptions = {
    variant: widget.defaultVariant,
    size: "default",
    showInput: false,
  };
  const [options, setOptions] = useState<WidgetDemoOptions>(defaults);
  function updateOptions(next: Partial<WidgetDemoOptions>) {
    setOptions((current) => ({ ...current, ...next }));
  }

  return (
    <div className="space-y-6 text-[15px] leading-7 sm:space-y-8">
      <section id="preview" aria-label="Live Preview" className="min-w-0">
        <Tabs defaultValue="preview">
          <TabsList
            aria-label="Widget Example"
            className="mb-3 h-auto group-data-horizontal/tabs:h-auto"
          >
            <TabsTrigger value="preview" className="h-11">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="h-11">
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="m-0">
            <div className="rounded-xl border border-border bg-muted/20 px-0 py-4 min-[360px]:px-3 sm:px-6">
              <WidgetDemo widget={widget} options={options} />
            </div>
          </TabsContent>
          <TabsContent value="code" className="m-0">
            <CodeBlock
              code={getUsageSnippet(widget, options)}
              label="Preview Code"
            />
          </TabsContent>
        </Tabs>
        <div className="px-1 pt-2">
          <p className="text-xs leading-5 text-muted-foreground">
            Runs locally—no account, project, or network request required.
          </p>
          <Accordion type="single" collapsible>
            <AccordionItem value="customize" className="border-0">
              <AccordionTrigger className="min-h-11 py-2 text-sm">
                Customize Preview
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid max-w-md grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preview-variant">Variant</Label>
                    <Select
                      value={options.variant}
                      onValueChange={(variant) =>
                        updateOptions({
                          variant: variant as WidgetDemoOptions["variant"],
                        })
                      }
                    >
                      <SelectTrigger
                        id="preview-variant"
                        className="h-11 w-full data-[size=default]:h-11"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emoji">Emoji</SelectItem>
                        <SelectItem value="icons">Icons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preview-size">Size</Label>
                    <Select
                      value={options.size}
                      onValueChange={(size) =>
                        updateOptions({
                          size: size as WidgetDemoOptions["size"],
                        })
                      }
                    >
                      <SelectTrigger
                        id="preview-size"
                        className="h-11 w-full data-[size=default]:h-11"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["sm", "default", "md", "lg"].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex min-h-11 items-center gap-3">
                  <Switch
                    id="preview-input"
                    checked={options.showInput}
                    onCheckedChange={(showInput) =>
                      updateOptions({ showInput })
                    }
                  />
                  <Label htmlFor="preview-input" className="cursor-pointer">
                    Optional Text Input
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => setOptions(defaults)}
                >
                  Restore Defaults
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      <section aria-labelledby="installation" className="min-w-0 space-y-4">
        <h2 id="installation" className="text-xl font-semibold tracking-tight">
          Installation
        </h2>
        <WidgetInstallCommand
          registryName={widget.registryName}
          metadata={widget.installMetadata}
        />
      </section>
      <section aria-labelledby="usage" className="min-w-0 space-y-4">
        <h2 id="usage" className="text-xl font-semibold tracking-tight">
          Usage
        </h2>
        <p className="text-muted-foreground">
          The local example does not store feedback. Choose Your Backend to save
          submissions. Examples follow your preview settings and keep success
          visible with{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            {"autoHide={false}"}
          </code>
          .
        </p>
        <Tabs defaultValue="local">
          <TabsList
            aria-label="Submission Example"
            className="h-auto group-data-horizontal/tabs:h-auto"
          >
            <TabsTrigger value="local" className="h-11">
              Local Example
            </TabsTrigger>
            <TabsTrigger value="custom" className="h-11">
              Your Backend
            </TabsTrigger>
          </TabsList>
          <TabsContent value="local">
            <CodeBlock
              code={getUsageSnippet(widget, options)}
              label="Local Example"
            />
          </TabsContent>
          <TabsContent value="custom" className="space-y-4">
            <p className="text-muted-foreground">
              Implement <code>/api/feedback</code> in your app. Validate the
              payload and persist it before returning success. No Sentimeter key
              is needed; the existing payload includes an empty{" "}
              <code>apiKey</code>.
            </p>
            <CodeBlock
              code={getUsageSnippet(widget, options, "custom")}
              label="Your Backend"
            />
          </TabsContent>
        </Tabs>
      </section>
      <section aria-labelledby="submission" className="space-y-4">
        <h2 id="submission" className="text-xl font-semibold tracking-tight">
          Submission Behavior
        </h2>
        <p className="text-muted-foreground">
          A custom <code>submit</code> handler takes precedence. Without it, a
          non-empty <code>apiKey</code> enables hosted analytics. With neither
          configured, the widget completes locally without sending or persisting
          feedback. Failed custom submissions remain retryable;{" "}
          <code>onSubmitError</code> receives the original error.
        </p>
        <Accordion type="single" collapsible>
          <AccordionItem value="compound">
            <AccordionTrigger className="min-h-11">
              Compound Composition
            </AccordionTrigger>
            <AccordionContent>
              <CodeBlock
                code={getCompoundSnippet(widget)}
                label="Compound Example"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="hosted">
            <AccordionTrigger className="min-h-11">
              Optional Hosted Analytics
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="leading-7 text-muted-foreground">
                Create a project in the{" "}
                <Link
                  href="/dashboard"
                  className="underline underline-offset-4"
                >
                  dashboard
                </Link>
                , use its publishable key, and configure allowed origins for
                production. Hosted failures expose{" "}
                <code>WidgetSubmitError</code> codes, HTTP status, and retry
                timing. See{" "}
                <Link
                  href="/components/getting-started#submission"
                  className="underline underline-offset-4"
                >
                  integration guidance
                </Link>
                .
              </p>
              <CodeBlock
                code={getUsageSnippet(widget, options, "hosted")}
                label="Hosted Example"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      <section aria-labelledby="props" className="min-w-0 space-y-4">
        <h2 id="props" className="text-xl font-semibold tracking-tight">
          Props
        </h2>
        <div
          role="region"
          aria-label={`${widget.name} Props`}
          tabIndex={0}
          className="max-w-full overflow-x-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widget.props.map((row) => (
                <TableRow key={row.prop}>
                  <TableCell className="font-mono text-xs">
                    {row.prop}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.type}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.defaultValue}
                  </TableCell>
                  <TableCell className="min-w-60 whitespace-normal text-sm leading-6">
                    {row.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
