import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import type { WidgetDocRow } from "@/lib/widget-catalog";

export function PropsTable({
  name,
  rows,
}: {
  name: string;
  rows: WidgetDocRow[];
}) {
  return (
    <div
      role="region"
      aria-label={`${name} Props`}
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
          {rows.map((row) => (
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
  );
}
