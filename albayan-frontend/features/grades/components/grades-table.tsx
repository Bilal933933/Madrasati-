"use client";

import { Pencil, School, Trash2 } from "lucide-react";
import { RowActions } from "@/components/shared/row-actions";
import { EntityThumb } from "@/components/shared/entity-thumb";
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
import type { Grade } from "@/features/grades/types/grade.types";
import type { Stage } from "@/features/stages/types/stage.types";

type GradesTableProps = {
  grades: Grade[];
  stages: Stage[];
  isLoading: boolean;
  onEdit: (grade: Grade) => void;
  onDelete: (grade: Grade) => void;
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

export function GradesTable({ grades, stages, isLoading, onEdit, onDelete }: GradesTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <School />
          </EmptyMedia>
          <EmptyTitle>لا توجد صفوف هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُعثر على صفوف ضمن هذا النطاق. أضف صفًا جديدًا أو غيّر فلتر المرحلة.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  const stageName = (stageId: number) =>
    stages.find((s) => s.id === stageId)?.name ?? `#${stageId}`;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          <TableHead className="hidden md:table-cell">المرحلة</TableHead>
          <TableHead className="hidden md:table-cell">الرابط (Slug)</TableHead>
          <TableHead className="hidden md:table-cell">الترتيب</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grades.map((grade) => (
          <TableRow key={grade.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <EntityThumb
                  image={grade.image}
                  icon={grade.icon}
                  color={grade.color}
                  label={grade.name}
                />
                <span className="font-medium">{grade.name}</span>
              </div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{stageName(grade.stage_id)}</TableCell>
            <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
              {grade.slug}
            </TableCell>
            <TableCell className="hidden md:table-cell">{grade.sort_order ?? "-"}</TableCell>
            <TableCell>
              <PublishedBadge published={grade.is_published} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${grade.name}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(grade),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(grade),
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
