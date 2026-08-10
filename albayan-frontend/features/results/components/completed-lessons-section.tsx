import { CalendarDays, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { formatDateTime } from "@/features/exams/lib/attemptFormat";
import type { CompletedLesson } from "@/features/student/types/student.types";

/**
 * قسم الدروس المكتملة في "نتائجي" — قائمة مجمّعة حسب المادة،
 * كل درس يعرض أيقونة/لون المادة والمقرر وتاريخ الإكمال مع رابط للدرس.
 */
export function CompletedLessonsSection({ items }: { items: CompletedLesson[] }) {
  const grouped = useMemo(() => {
    const groups = new Map<string, { subject: CompletedLesson["subject"]; lessons: CompletedLesson[] }>();
    for (const item of items) {
      const key = item.subject.slug;
      const existing = groups.get(key);
      if (existing) {
        existing.lessons.push(item);
      } else {
        groups.set(key, { subject: item.subject, lessons: [item] });
      }
    }
    return Array.from(groups.values());
  }, [items]);

  if (items.length === 0) {
    return (
      <Empty className="border-dashed py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle2 className="size-4" />
          </EmptyMedia>
          <EmptyTitle>لا توجد دروس مكتملة بعد</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            أنهِ درسًا أولًا ليظهر هنا في سجل نتائجك.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ subject, lessons }) => {
        const Icon = EXPLORE_ICONS[subject.icon ?? ""];
        return (
          <section key={subject.slug}>
            <ScrollReveal>
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: subject.color ?? "#0ea5e9" }}
                >
                  {Icon ? <Icon className="size-4" aria-hidden /> : null}
                </span>
                <h2 className="text-sm font-bold text-foreground">{subject.name}</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {lessons.length} درس
                </span>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {lessons.map((item, index) => (
                <ScrollReveal key={item.id} delay={index * 60}>
                  <Link
                    href={`/learn/${item.lesson.slug}`}
                    className="group flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/60 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {item.lesson.title}
                      </span>
                      <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.course_name}</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CalendarDays className="size-3.5" aria-hidden />
                      أُكمل {formatDateTime(item.completed_at)}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
