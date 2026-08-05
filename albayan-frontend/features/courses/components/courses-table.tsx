"use client";

import { Pencil, GraduationCap, Trash2 } from "lucide-react";
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
import type { Course } from "@/features/courses/types/course.types";
import type { Subject } from "@/features/subjects/types/subject.types";
import type { Grade } from "@/features/grades/types/grade.types";
import type { Stage } from "@/features/stages/types/stage.types";

type CoursesTableProps = {
  courses: Course[];
  subjects: Subject[];
  grades: Grade[];
  stages: Stage[];
  isLoading: boolean;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
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

export function CoursesTable({ courses, subjects, grades, stages, isLoading, onEdit, onDelete }: CoursesTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GraduationCap />
          </EmptyMedia>
          <EmptyTitle>لا توجد مقررات هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُعثر على مقررات ضمن هذا النطاق. أضف مقررًا جديدًا أو غيّر فلتر المادة.
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
          <TableHead className="min-w-56">الاسم</TableHead>
          <TableHead className="hidden md:table-cell">المادة</TableHead>
          <TableHead className="hidden md:table-cell">الصف</TableHead>
          <TableHead className="hidden md:table-cell">المرحلة</TableHead>
          <TableHead className="hidden md:table-cell">الترتيب</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="pe-2 text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell className="min-w-56">
              <div className="flex items-center gap-2.5">
                <EntityThumb
                  image={course.image}
                  icon={course.icon}
                  color={course.color}
                  label={course.name}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="min-w-0 truncate font-medium">{course.name}</span>
                  {course.description && (
                    <span className="line-clamp-1 max-w-56 text-xs text-muted-foreground">
                      {course.description}
                    </span>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{subjectName(course.subject_id)}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{gradeName(course.subject_id)}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{stageName(course.subject_id)}</TableCell>
            <TableCell className="hidden md:table-cell">{course.sort_order ?? "-"}</TableCell>
            <TableCell>
              <PublishedBadge published={course.is_published} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${course.name}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(course),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(course),
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
