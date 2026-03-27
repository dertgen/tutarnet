import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: Column[];
  rows: ReactNode[][];
  emptyLabel?: string;
  className?: string;
}

export function DataTable({ columns, rows, emptyLabel = "Kayıt bulunamadı", className }: DataTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-md border", className)}>
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-slate-500 h-10",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  !col.align && "text-left",
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-slate-400 h-24"
              >
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, ri) => (
              <TableRow
                key={ri}
                className="hover:bg-slate-50 transition-colors"
              >
                {row.map((cell, ci) => (
                  <TableCell
                    key={ci}
                    style={{ width: columns[ci]?.width }}
                    className={cn(
                      "px-4 py-3 text-slate-700 align-middle",
                      columns[ci]?.align === "center" && "text-center",
                      columns[ci]?.align === "right" && "text-right",
                    )}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
