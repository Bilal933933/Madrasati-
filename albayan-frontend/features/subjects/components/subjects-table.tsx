"use client";

import { Pencil, BookOpen, Trash2 } from "lucide-react";
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
import type { Subject } from "@/features/subjects/types/subject.types";
import type { Grade } from "@/features/grades/types/grade.types";
import type { Stage } from "@/features/stages/types/stage.types";

type SubjectsTableProps = {
  subjects: Subject[];
  grades: Grade[];
  stages: Stage[];
  isLoading: boolean;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
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

export function SubjectsTable({ subjects, grades, stages, isLoading, onEdit, onDelete }: SubjectsTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen />
          </EmptyMedia>
          <EmptyTitle>لا توجد مواد هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُعثر على مواد ضمن هذا النطاق. أضف مادة جديدة أو غيّر فلتر الصف.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  const gradeName = (gradeId: number) =>
    grades.find((g) => g.id === gradeId)?.name ?? `#${gradeId}`;
  const stageName = (gradeId: number) => {
    const grade = grades.find((g) => g.id === gradeId);
    return stages.find((s) => s.id === grade?.stage_id)?.name ?? "-";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          <TableHead>الصف</TableHead>
          <TableHead>المرحلة</TableHead>
          <TableHead>الرابط (Slug)</TableHead>
          <TableHead>الترتيب</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow key={subject.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <EntityThumb
                  image={subject.image}
                  icon={subject.icon}
                  color={subject.color}
                  label={subject.name}
                />
                <span className="font-medium">{subject.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{gradeName(subject.grade_id)}</TableCell>
            <TableCell className="text-muted-foreground">{stageName(subject.grade_id)}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {subject.slug}
            </TableCell>
            <TableCell>{subject.sort_order ?? "-"}</TableCell>
            <TableCell>
              <PublishedBadge published={subject.is_published} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${subject.name}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(subject),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(subject),
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
