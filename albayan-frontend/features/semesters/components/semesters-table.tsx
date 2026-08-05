"use client";

import { Pencil, CalendarDays, Trash2 } from "lucide-react";
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
import type { Semester } from "@/features/semesters/types/semester.types";
import type { Grade } from "@/features/grades/types/grade.types";

type SemestersTableProps = {
  semesters: Semester[];
  grades: Grade[];
  isLoading: boolean;
  onEdit: (semester: Semester) => void;
  onDelete: (semester: Semester) => void;
};

export function SemestersTable({ semesters, grades, isLoading, onEdit, onDelete }: SemestersTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (semesters.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDays />
          </EmptyMedia>
          <EmptyTitle>لا توجد فصول هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُعثر على فصول ضمن هذا النطاق. أضف فصلًا جديدًا أو غيّر فلتر الصف.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  const gradeName = (gradeId: number) =>
    grades.find((g) => g.id === gradeId)?.name ?? `#${gradeId}`;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          <TableHead className="hidden md:table-cell">الصف</TableHead>
          <TableHead className="hidden md:table-cell">الترتيب</TableHead>
          <TableHead className="text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {semesters.map((semester) => (
          <TableRow key={semester.id}>
            <TableCell>
              <span className="font-medium">{semester.name}</span>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{gradeName(semester.grade_id)}</TableCell>
            <TableCell className="hidden md:table-cell">{semester.sort_order ?? "-"}</TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${semester.name}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(semester),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(semester),
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
