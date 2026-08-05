"use client";

import { Pencil, PlayCircle, Trash2 } from "lucide-react";
import { RowActions } from "@/components/shared/row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { Paragraph } from "@/features/paragraphs/types/paragraph.types";

type ParagraphsTableProps = {
  paragraphs: Paragraph[];
  isLoading: boolean;
  onEdit: (paragraph: Paragraph) => void;
  onDelete: (paragraph: Paragraph) => void;
};

export function ParagraphsTable({ paragraphs, isLoading, onEdit, onDelete }: ParagraphsTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (paragraphs.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PlayCircle />
          </EmptyMedia>
          <EmptyTitle>لا توجد فقرات هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم تُعثر على فقرات ضمن هذا الدرس. أضف فقرة جديدة.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الفقرة</TableHead>
          <TableHead className="hidden md:table-cell">الترتيب</TableHead>
          <TableHead className="hidden md:table-cell">الوسائط</TableHead>
          <TableHead className="text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paragraphs.map((paragraph) => (
          <TableRow key={paragraph.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {paragraph.icon ? (
                    <span className="text-lg">{paragraph.icon}</span>
                  ) : (
                    <span className="text-base">📄</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{paragraph.title}</span>
                  {paragraph.content && (
                    <span className="line-clamp-1 max-w-72 text-xs text-muted-foreground">
                      {paragraph.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                    </span>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{paragraph.sort_order ?? "-"}</TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex items-center gap-2">
                {paragraph.image && (
                  <span
                    data-slot="badge"
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    صورة
                  </span>
                )}
                {paragraph.video && (
                  <span
                    data-slot="badge"
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    فيديو
                  </span>
                )}
                {!paragraph.image && !paragraph.video && <span className="text-xs text-muted-foreground">-</span>}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${paragraph.title}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(paragraph),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(paragraph),
                    },
                  ]}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
