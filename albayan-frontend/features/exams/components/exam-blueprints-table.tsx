"use client";

import { Pencil, Trash2, FileCheck2 } from "lucide-react";
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
import { EXAM_TYPE_LABELS, type ExamBlueprint } from "@/features/exams/types/exam.types";

type ExamBlueprintsTableProps = {
  blueprints: ExamBlueprint[];
  isLoading: boolean;
  onEdit: (blueprint: ExamBlueprint) => void;
  onDelete: (blueprint: ExamBlueprint) => void;
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      data-slot="badge"
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function ExamBlueprintsTable({ blueprints, isLoading, onEdit, onDelete }: ExamBlueprintsTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (blueprints.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileCheck2 />
          </EmptyMedia>
          <EmptyTitle>لا توجد امتحانات هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُعثر على تعريفات امتحان. أضف تعريفًا جديدًا أو غيّر الفلاتر.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-48">العنوان</TableHead>
          <TableHead className="hidden md:table-cell">النوع</TableHead>
          <TableHead className="hidden lg:table-cell">النطاق</TableHead>
          <TableHead>الأسئلة</TableHead>
          <TableHead className="hidden sm:table-cell">المدة</TableHead>
          <TableHead className="hidden sm:table-cell">عتبة النجاح</TableHead>
          <TableHead className="hidden md:table-cell">الحالة</TableHead>
          <TableHead className="pe-2 text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blueprints.map((blueprint) => (
          <TableRow key={blueprint.id}>
            <TableCell className="min-w-48">
              <div className="flex flex-col">
                <span className="truncate font-medium">{blueprint.title}</span>
                {blueprint.description && (
                  <span className="line-clamp-1 max-w-56 text-xs text-muted-foreground">
                    {blueprint.description}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge className="bg-accent text-accent-foreground">
                {blueprint.exam_type_label ?? EXAM_TYPE_LABELS[blueprint.exam_type]}
              </Badge>
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">
              {blueprint.scope_name ?? "-"}
              {blueprint.month_no ? ` (الشهر ${blueprint.month_no})` : ""}
            </TableCell>
            <TableCell>
              <Badge className="bg-primary/10 text-primary">
                {blueprint.total_questions}
              </Badge>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
              {blueprint.duration_minutes} د
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
              {blueprint.pass_threshold_percent}%
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge
                className={
                  blueprint.is_active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }
              >
                {blueprint.is_active ? "مفعّل" : "معطل"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${blueprint.title}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(blueprint),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(blueprint),
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