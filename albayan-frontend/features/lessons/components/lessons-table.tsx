"use client";

import { useRouter } from "next/navigation";
import { GitBranch, Pencil, PlayCircle, Trash2 } from "lucide-react";
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
import type { Lesson } from "@/features/lessons/types/lesson.types";
import type { Course } from "@/features/courses/types/course.types";
import type { Subject } from "@/features/subjects/types/subject.types";
import type { Grade } from "@/features/grades/types/grade.types";
import type { Stage } from "@/features/stages/types/stage.types";

type LessonsTableProps = {
  lessons: Lesson[];
  courses: Course[];
  subjects: Subject[];
  grades: Grade[];
  stages: Stage[];
  isLoading: boolean;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
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

export function LessonsTable({ lessons, courses, subjects, grades, stages, isLoading, onEdit, onDelete }: LessonsTableProps) {
  const router = useRouter();
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PlayCircle />
          </EmptyMedia>
          <EmptyTitle>لا توجد دروس هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُعثر على دروس ضمن هذا النطاق. أضف درسًا جديدًا أو غيّر فلتر المقرر.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  const courseName = (courseId: number) =>
    courses.find((c) => c.id === courseId)?.name ?? `#${courseId}`;
  const subjectName = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    return subjects.find((s) => s.id === course?.subject_id)?.name ?? "-";
  };
  const gradeName = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    const subject = subjects.find((s) => s.id === course?.subject_id);
    return grades.find((g) => g.id === subject?.grade_id)?.name ?? "-";
  };
  const stageName = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    const subject = subjects.find((s) => s.id === course?.subject_id);
    const grade = grades.find((g) => g.id === subject?.grade_id);
    return stages.find((s) => s.id === grade?.stage_id)?.name ?? "-";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-56">العنوان</TableHead>
          <TableHead className="hidden md:table-cell">المقرر</TableHead>
          <TableHead className="hidden md:table-cell">المادة</TableHead>
          <TableHead className="hidden md:table-cell">الصف</TableHead>
          <TableHead className="hidden md:table-cell">المرحلة</TableHead>
          <TableHead className="hidden md:table-cell">الترتيب</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="pe-2 text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lessons.map((lesson) => (
          <TableRow key={lesson.id}>
            <TableCell className="min-w-56">
              <div className="flex items-center gap-2.5">
                <EntityThumb
                  image={lesson.image}
                  icon={lesson.icon}
                  color={lesson.color}
                  label={lesson.title}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="min-w-0 truncate font-medium">{lesson.title}</span>
                  {lesson.summary && (
                    <span className="line-clamp-1 max-w-56 text-xs text-muted-foreground">
                      {lesson.summary}
                    </span>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{courseName(lesson.course_id)}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{subjectName(lesson.course_id)}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{gradeName(lesson.course_id)}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{stageName(lesson.course_id)}</TableCell>
            <TableCell className="hidden md:table-cell">{lesson.sort_order ?? "-"}</TableCell>
            <TableCell>
              <PublishedBadge published={lesson.is_published} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${lesson.title}`}
                  items={[
                    {
                      key: "builder",
                      label: "محرر الرحلة",
                      icon: <GitBranch />,
                      onSelect: () => router.push(`/admin/lessons/${lesson.id}`),
                    },
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(lesson),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(lesson),
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
