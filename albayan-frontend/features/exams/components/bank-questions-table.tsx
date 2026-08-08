"use client";

import { Pencil, Trash2, HelpCircle } from "lucide-react";
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
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  type BankQuestion,
  type Difficulty,
} from "@/features/exams/types/exam.types";

type BankQuestionsTableProps = {
  questions: BankQuestion[];
  isLoading: boolean;
  onEdit: (question: BankQuestion) => void;
  onDelete: (question: BankQuestion) => void;
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

export function BankQuestionsTable({ questions, isLoading, onEdit, onDelete }: BankQuestionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HelpCircle />
          </EmptyMedia>
          <EmptyTitle>لا توجد أسئلة هنا</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            لم يُعثر على أسئلة ضمن هذا النطاق. أضف سؤالًا جديدًا أو غيّر الفلاتر.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-56">نص السؤال</TableHead>
          <TableHead className="hidden md:table-cell">الدرس</TableHead>
          <TableHead className="hidden sm:table-cell">النوع</TableHead>
          <TableHead>الصعوبة</TableHead>
          <TableHead className="hidden md:table-cell">الحالة</TableHead>
          <TableHead className="pe-2 text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((question) => (
          <TableRow key={question.id}>
            <TableCell className="min-w-56">
              <span className="line-clamp-2 font-medium">{question.content}</span>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">
              {question.lesson_title ?? "-"}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge className="bg-accent text-accent-foreground">
                {QUESTION_TYPE_LABELS[question.type]}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                className={
                  question.difficulty === "easy"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : question.difficulty === "medium"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-rose-500/10 text-rose-600"
                }
              >
                {DIFFICULTY_LABELS[question.difficulty as Difficulty]}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge
                className={
                  question.is_active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }
              >
                {question.is_active ? "مفعّل" : "معطل"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات السؤال ${question.id}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(question),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(question),
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