"use client";

import { Pencil, Layers, Trash2 } from "lucide-react";
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
import type { Section } from "@/features/sections/types/section.types";
import type { Subject } from "@/features/subjects/types/subject.types";
import type { Grade } from "@/features/grades/types/grade.types";
import type { Stage } from "@/features/stages/types/stage.types";

type SectionsTableProps = {
  sections: Section[];
  subjects: Subject[];
  grades: Grade[];
  stages: Stage[];
  isLoading: boolean;
  onEdit: (section: Section) => void;
  onDelete: (section: Section) => void;
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

export function SectionsTable({ sections, subjects, grades, stages, isLoading, onEdit, onDelete }: SectionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Layers />
          </EmptyMedia>
          <EmptyTitle>لا توجد وحدات هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُعثر على وحدات ضمن هذا النطاق. أضف وحدة جديدة أو غيّر فلتر المادة.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  const subjectName = (subjectId: number) =>
    subjects.find((s) => s.id === subjectId)?.name ?? `#${subjectId}`;
  const gradeName = (subjectId: number) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return grades.find((g) => g.id === subject?.grade_id)?.name ?? "-";
  };
  const stageName = (subjectId: number) => {
    const subject = subjects.find((s) => s.id === subjectId);
    const grade = grades.find((g) => g.id === subject?.grade_id);
    return stages.find((s) => s.id === grade?.stage_id)?.name ?? "-";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          <TableHead>المادة</TableHead>
          <TableHead>الصف</TableHead>
          <TableHead>المرحلة</TableHead>
          <TableHead>الترتيب</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sections.map((section) => (
          <TableRow key={section.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium text-primary-foreground"
                  style={{ backgroundColor: section.color ?? "var(--primary)" }}
                >
                  {section.icon ?? section.name.charAt(0)}
                </span>
                <span className="font-medium">{section.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{subjectName(section.subject_id)}</TableCell>
            <TableCell className="text-muted-foreground">{gradeName(section.subject_id)}</TableCell>
            <TableCell className="text-muted-foreground">{stageName(section.subject_id)}</TableCell>
            <TableCell>{section.sort_order ?? "-"}</TableCell>
            <TableCell>
              <PublishedBadge published={section.is_published} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${section.name}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(section),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(section),
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
