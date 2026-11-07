"use client";

import { useState } from "react";
import { Play, Smartphone } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
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
  feedbackFormContextDescription,
  feedbackFormCompletionDescription,
  surveyOptionsDescription,
  surveyCompletionDescription,
  getCompoundSnippet,
  getUsageSnippet,
  localExampleNote,
  type WidgetDemoOptions,
  type WidgetDocConfig,
} from "@/lib/widget-catalog";
import { WidgetInstallCommand } from "./widget-install-command";
import { WidgetDemo } from "./widget-demo";
import { CodeBlock } from "./code-block";

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex rounded-lg bg-muted p-0.5"
    >
      {options.map(([option, text]) => (
        <Button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          variant="ghost"
          className={cn(
            "text-muted-foreground",
            value === option && "bg-background text-foreground shadow-sm",
          )}
          onClick={() => onChange(option)}
        >
          {text}
        </Button>
      ))}
    </div>
  );
}

export function WidgetDocsContent({ widget }: { widget: WidgetDocConfig }) {
  const rating = widget.preview !== "form" && widget.preview !== "survey";
  const defaults = widget.example;
  const [options, setOptions] = useState<WidgetDemoOptions>(defaults);
  const [replay, setReplay] = useState(0);
  const [phone, setPhone] = useState(false);
  function updateOptions(next: Partial<WidgetDemoOptions>) {
    setOptions((current) => ({ ...current, ...next }));
  }

  return (
    <div className="docs-content">
      <section id="preview" aria-label="Live Preview" className="min-w-0">
        <Tabs
          defaultValue="preview"
          className="gap-0 overflow-hidden rounded-xl border"
        >
          <div className="flex flex-wrap items-center gap-2 border-b bg-card p-2">
            <TabsList aria-label="Widget Example">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex flex-wrap items-center gap-1">
              {rating ? (
                <Segmented
                  label="Layout"
                  value={options.layout}
                  options={[
                    ["stacked", "Stacked"],
                    ["inline", "Inline"],
                  ]}
                  onChange={(layout) => updateOptions({ layout })}
                />
              ) : null}
              {rating && widget.defaultVariant !== null ? (
                <Segmented
                  label="Glyphs"
                  value={options.variant}
                  options={[
                    ["emoji", "Emoji"],
                    ["icons", "Icons"],
                  ]}
                  onChange={(variant) => updateOptions({ variant })}
                />
              ) : null}
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => setReplay((value) => value + 1)}
              >
                <Play aria-hidden="true" className="size-3.5" />
                Replay
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Phone width"
                aria-pressed={phone}
                className={cn("max-sm:hidden", phone && "bg-accent")}
                onClick={() => setPhone((value) => !value)}
              >
                <Smartphone aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>
          <TabsContent value="preview" className="m-0">
            <div className="bg-muted/40">
              <div
                className={cn(
                  "mx-auto w-full",
                  phone && "max-w-sm border-x border-border",
                )}
              >
                <WidgetDemo
                  widget={widget}
                  options={options}
                  replay={replay}
                  framed={false}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="code" className="m-0">
            <CodeBlock
              code={getUsageSnippet(widget, options)}
              label="Preview Code"
            />
          </TabsContent>
        </Tabs>
        <p className="ds-caption px-1 pt-3 text-muted-foreground">
          {localExampleNote}
        </p>
      </section>
      <section aria-labelledby="installation" className="docs-section min-w-0">
        <h2 id="installation" className="ds-section-title">
          Installation
        </h2>
        <WidgetInstallCommand
          registryName={widget.registryName}
          metadata={widget.installMetadata}
        />
      </section>
      <section aria-labelledby="usage" className="docs-section min-w-0">
        <h2 id="usage" className="ds-section-title">
          Usage
        </h2>
        <p className="ds-body text-muted-foreground">
          The code follows your preview settings. Without a <code>submit</code>{" "}
          handler, nothing is sent or stored; choose Your Backend to save
          feedback.{" "}
          <Link
            href="/components/getting-started#submission"
            className="docs-link"
          >
            Connect your backend
          </Link>{" "}
          covers errors and retries.
        </p>
        <Tabs defaultValue="local">
          <TabsList aria-label="Submission Example">
            <TabsTrigger value="local">Local Example</TabsTrigger>
            <TabsTrigger value="custom">Your Backend</TabsTrigger>
          </TabsList>
          <TabsContent value="local">
            <CodeBlock
              code={getUsageSnippet(widget, options)}
              label="Local Example"
            />
          </TabsContent>
          <TabsContent value="custom" className="docs-section">
            <p className="ds-body text-muted-foreground">
              Implement <code>/api/feedback</code> in your app. Validate the
              payload and persist it before returning success. The payload
              includes <code>location</code> and <code>widgetType</code>,{" "}
              {rating ? (
                <>
                  <code>value</code> and optional <code>text</code>.
                </>
              ) : widget.preview === "survey" ? (
                <>
                  the chosen string <code>value</code> and optional{" "}
                  <code>text</code>.
                </>
              ) : (
                <>
                  <code>text</code> and <code>context</code>.
                </>
              )}
            </p>
            <CodeBlock
              code={getUsageSnippet(widget, options, "custom")}
              label="Your Backend"
            />
          </TabsContent>
        </Tabs>
        {rating ? (
          <Accordion type="single" collapsible>
            <AccordionItem value="compound">
              <AccordionTrigger className="min-h-11">
                Compose the parts yourself
              </AccordionTrigger>
              <AccordionContent>
                <CodeBlock
                  code={getCompoundSnippet(widget)}
                  label="Compound Example"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className="space-y-4">
            <p className="ds-body text-muted-foreground">
              {widget.preview === "survey"
                ? surveyOptionsDescription
                : feedbackFormContextDescription}
            </p>
            <p className="ds-body text-muted-foreground">
              {widget.preview === "survey"
                ? surveyCompletionDescription
                : feedbackFormCompletionDescription}
            </p>
          </div>
        )}
      </section>
      <section aria-labelledby="props" className="docs-section min-w-0">
        <h2 id="props" className="ds-section-title">
          Props
        </h2>
        <div
          role="region"
          aria-label={`${widget.name} Props`}
          tabIndex={0}
          className="docs-props ds-panel max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">Prop</TableHead>
                <TableHead className="w-48">Type</TableHead>
                <TableHead className="w-32">Default</TableHead>
                <TableHead className="min-w-64">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widget.props.map((row) => (
                <TableRow key={row.prop}>
                  <TableCell className="ds-code">{row.prop}</TableCell>
                  <TableCell className="ds-code whitespace-normal break-words text-muted-foreground">
                    {row.type}
                  </TableCell>
                  <TableCell className="ds-code whitespace-normal break-words text-muted-foreground">
                    {row.defaultValue}
                  </TableCell>
                  <TableCell className="ds-body min-w-64 whitespace-normal">
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
