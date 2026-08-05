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
import type { Semester } from "@/features/semesters/types/semester.types";

type SubjectsTableProps = {
  subjects: Subject[];
  grades: Grade[];
  stages: Stage[];
  semesters: Semester[];
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

export function SubjectsTable({ subjects, grades, stages, semesters, isLoading, onEdit, onDelete }: SubjectsTableProps) {
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
  const semesterName = (semesterId: number | null) =>
    semesterId ? semesters.find((s) => s.id === semesterId)?.name ?? "#" + semesterId : "-";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-48">الاسم</TableHead>
          <TableHead className="hidden md:table-cell">الصف</TableHead>
          <TableHead className="hidden md:table-cell">المرحلة</TableHead>
          <TableHead className="hidden md:table-cell">الفصل</TableHead>
          <TableHead className="hidden md:table-cell">الرابط (Slug)</TableHead>
          <TableHead className="hidden md:table-cell">الترتيب</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="pe-2 text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow key={subject.id}>
            <TableCell className="min-w-48">
              <div className="flex items-center gap-2.5">
                <EntityThumb
                  image={subject.image}
                  icon={subject.icon}
                  color={subject.color}
                  label={subject.name}
                />
                <span className="min-w-0 font-medium">{subject.name}</span>
              </div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{gradeName(subject.grade_id)}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{stageName(subject.grade_id)}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{semesterName(subject.semester_id)}</TableCell>
            <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
              {subject.slug}
            </TableCell>
            <TableCell className="hidden md:table-cell">{subject.sort_order ?? "-"}</TableCell>
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
