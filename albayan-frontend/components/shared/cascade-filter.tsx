"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type {
  CascadeFilterState,
  CascadeLevel,
  CascadeOptions,
} from "@/components/shared/use-cascade-filter";

type LevelMeta = {
  label: string;
  allLabel: string;
  ariaLabel: string;
};

const LEVEL_META: Record<CascadeLevel, LevelMeta> = {
  stage: { label: "المرحلة", allLabel: "كل المراحل", ariaLabel: "تصفية حسب المرحلة" },
  grade: { label: "الصف", allLabel: "كل الصفوف", ariaLabel: "تصفية حسب الصف" },
  semester: { label: "الفصل", allLabel: "كل الفصول", ariaLabel: "تصفية حسب الفصل" },
  subject: { label: "المادة", allLabel: "كل المواد", ariaLabel: "تصفية حسب المادة" },
  course: { label: "المقرر", allLabel: "كل المقررات", ariaLabel: "تصفية حسب المقرر" },
};

type OptionItem = { id: number; name: string };

function optionsFor(level: CascadeLevel, options: CascadeOptions): OptionItem[] {
  switch (level) {
    case "stage":
      return options.stage;
    case "grade":
      return options.grade;
    case "semester":
      return options.semester;
    case "subject":
      return options.subject;
    case "course":
      return options.course;
  }
}

type CascadeFilterProps = {
  filter: CascadeFilterState;
  levels: CascadeLevel[];
  /** عدد النتائج المعروضة بعد الفلترة — يُعرض كتغذية راجعة */
  count?: number;
  /** عناصر إضافية تُرسم بجانب السليكتات (مثل نوع الامتحان، الصعوبة) */
  children?: ReactNode;
};

/**
 * فلاتر تسلسلية فورية: كل سليكت يعرض خيارات المتعلقة بالاختيار الأعلى منه،
 * وتُصفَّر المستويات الأعمق عند تغيير أي مستوى.
 * مع شارات للفلاتر النشطة قابلة للإزالة + زر مسح الكل + عدّاد نتائج.
 */
export function CascadeFilter({ filter, levels, count, children }: CascadeFilterProps) {
  const active = levels.flatMap((level) => {
    const value = filter.values[level];
    if (!value || value === "all") return [];
    const item = optionsFor(level, filter.options).find((o) => String(o.id) === value);
    return item ? [{ level, label: LEVEL_META[level].label, name: item.name }] : [];
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {levels.map((level) => {
          const meta = LEVEL_META[level];
          const value = filter.values[level] ?? "all";
          const isActive = value !== "all";

          return (
            <Select
              key={level}
              value={value}
              onValueChange={(next) => filter.setValue(level, next)}
            >
              <SelectTrigger
                aria-label={meta.ariaLabel}
                className={cn(
                  "w-full sm:w-52",
                  isActive && "border-primary/60 ring-2 ring-primary/20"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{meta.allLabel}</SelectItem>
                {optionsFor(level, filter.options).map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
        {children}
      </div>

      {(active.length > 0 || count !== undefined) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {active.map((chip) => (
            <span
              key={chip.level}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {chip.label}: {chip.name}
              <button
                type="button"
                onClick={() => filter.setValue(chip.level, "all")}
                aria-label={`إزالة فلتر ${chip.label}`}
                className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

          {active.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={filter.reset}
              className="h-6 gap-1 px-2 text-xs text-muted-foreground"
            >
              <X className="size-3" />
              مسح الكل
            </Button>
          )}

          {count !== undefined && (
            <span className="text-xs text-muted-foreground">{count} نتيجة</span>
          )}
        </div>
      )}
    </div>
  );
}