"use client";

import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
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
import type { Stage } from "@/features/stages/types/stage.types";

type StagesTableProps = {
  stages: Stage[];
  isLoading: boolean;
  onEdit: (stage: Stage) => void;
  onDelete: (stage: Stage) => void;
};

function PublishedBadge({ published }: { published: boolean | null }) {
  const isPublished = published === true;

  return (
    <span
      data-slot="badge"
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isPublished
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {isPublished ? "منشور" : "غير منشور"}
    </span>
  );
}

export function StagesTable({ stages, isLoading, onEdit, onDelete }: StagesTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageIcon />
          </EmptyMedia>
          <EmptyTitle>لا توجد مراحل بعد</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            ابدأ بإضافة المرحلة الأولى لتنظيم المنهج.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          <TableHead>الرابط (Slug)</TableHead>
          <TableHead>الترتيب</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stages.map((stage) => (
          <TableRow key={stage.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium text-primary-foreground"
                  style={{ backgroundColor: stage.color ?? "var(--primary)" }}
                >
                  {stage.icon ?? stage.name.charAt(0)}
                </span>
                <span className="font-medium">{stage.name}</span>
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {stage.slug}
            </TableCell>
            <TableCell>{stage.sort_order ?? "-"}</TableCell>
            <TableCell>
              <PublishedBadge published={stage.is_published} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${stage.name}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(stage),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(stage),
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
