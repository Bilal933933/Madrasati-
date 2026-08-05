"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CascadeFilterState,
  CascadeLevel,
  CascadeOptions,
} from "@/components/shared/use-cascade-filter";

type LevelMeta = {
  allLabel: string;
  ariaLabel: string;
};

const LEVEL_META: Record<CascadeLevel, LevelMeta> = {
  stage: { allLabel: "كل المراحل", ariaLabel: "تصفية حسب المرحلة" },
  grade: { allLabel: "كل الصفوف", ariaLabel: "تصفية حسب الصف" },
  semester: { allLabel: "كل الفصول", ariaLabel: "تصفية حسب الفصل" },
  subject: { allLabel: "كل المواد", ariaLabel: "تصفية حسب المادة" },
  course: { allLabel: "كل المقررات", ariaLabel: "تصفية حسب المقرر" },
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
};

/**
 * فلاتر تسلسلية فورية: كل سليكت يعرض خيارات المتعلقة بالاختيار الأعلى منه،
 * وتُصفَّر المستويات الأعمق عند تغيير أي مستوى.
 */
export function CascadeFilter({ filter, levels }: CascadeFilterProps) {
  return (
    <>
      {levels.map((level) => {
        const meta = LEVEL_META[level];
        const value = filter.values[level] ?? "all";

        return (
          <Select
            key={level}
            value={value}
            onValueChange={(next) => filter.setValue(level, next)}
          >
            <SelectTrigger aria-label={meta.ariaLabel} className="w-full sm:w-52">
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
    </>
  );
}
