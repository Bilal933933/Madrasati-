"use client";

import { Pencil, Trash2, Trophy } from "lucide-react";
import { RowActions } from "@/components/shared/row-actions";
import { IconByName } from "@/components/shared/icon-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { AchievementDefinition } from "@/features/achievements/types/achievement.types";

type AchievementsTableProps = {
  items: AchievementDefinition[];
  isLoading: boolean;
  onEdit: (achievement: AchievementDefinition) => void;
  onDelete: (achievement: AchievementDefinition) => void;
};

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      data-slot="badge"
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      }`}
    >
      {active ? "مفعّل" : "معطّل"}
    </span>
  );
}

export function AchievementsTable({
  items,
  isLoading,
  onEdit,
  onDelete,
}: AchievementsTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trophy />
          </EmptyMedia>
          <EmptyTitle>لا توجد إنجازات بعد</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            أضف وسمًا جديدًا ليبدأ الطلاب بجمع إنجازاتهم.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-64">الإنجاز</TableHead>
          <TableHead className="hidden md:table-cell">المقياس</TableHead>
          <TableHead className="hidden sm:table-cell">العتبة</TableHead>
          <TableHead className="hidden md:table-cell">الترتيب</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="pe-2 text-end">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((achievement) => (
          <TableRow key={achievement.id}>
            <TableCell className="min-w-64">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <IconByName name={achievement.icon} className="size-4" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="min-w-0 truncate font-medium">
                    {achievement.title}
                  </span>
                  <span className="line-clamp-1 max-w-64 text-xs text-muted-foreground">
                    {achievement.key}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">
              {achievement.metric_label}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {achievement.threshold}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {achievement.sort_order}
            </TableCell>
            <TableCell>
              <ActiveBadge active={achievement.is_active} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <RowActions
                  ariaLabel={`إجراءات ${achievement.title}`}
                  items={[
                    {
                      key: "edit",
                      label: "تعديل",
                      icon: <Pencil />,
                      onSelect: () => onEdit(achievement),
                    },
                    {
                      key: "delete",
                      label: "حذف",
                      icon: <Trash2 />,
                      destructive: true,
                      onSelect: () => onDelete(achievement),
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