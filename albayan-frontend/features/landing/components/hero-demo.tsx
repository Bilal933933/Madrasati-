"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "question" | "feedback" | "lesson";

const STEP_LABELS = [
  "التقييم القبلي",
  "الفقرة الأولى",
  "تقييم تكويني",
  "الفقرة الثانية",
  "التقييم النهائي",
];

const DEMO_OPTIONS = ["مبتدأ مرفوع", "خبر مرفوع", "مفعول به"];

const FEEDBACK_MESSAGE =
  "هكذا تبدأ كل دروسنا: نقيس ما تعرفه أولًا، ثم نبني عليه.";

/**
 * المعاينة التفاعلية في الـ Hero (يسار RTL):
 * شاشة درس مصغّرة بحالات متحركة — يختار الزائر إجابة فيشعر أنه داخل الدرس:
 * سؤال قبلي ← تغذية راجعة ← انتقال إلى الفقرة ← بطاقة التحسن (قبل/بعد).
 */
export function HeroDemo() {
  const [phase, setPhase] = useState<Phase>("question");
  const [selected, setSelected] = useState<string | null>(null);

  const activeIndex = useMemo(() => {
    if (phase === "lesson") return 1;
    return selected ? 1 : 0;
  }, [phase, selected]);

  const doneCount = useMemo(() => (selected ? 1 : 0), [selected]);

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-lg shadow-primary/5">
        {/* رأس الشاشة */}
        <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">درس تجريبي</p>
            <h3 className="font-bold">المبتدأ والخبر</h3>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            ⏱ 18 دقيقة
          </span>
        </div>

        {/* شريط التقدم */}
        <div className="border-b px-5 py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>رحلة الدرس</span>
            <span>
              {phase === "question" && "قبل البدء"}
              {phase === "feedback" && "بدأنا!"}
              {phase === "lesson" && "الفقرة الأولى"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: phase === "question" ? "0%" : phase === "feedback" ? "25%" : "50%" }}
            />
          </div>
        </div>

        {/* الخطوات */}
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 px-5 pt-4">
          {STEP_LABELS.map((label, index) => {
            const isDone = index < doneCount;
            const isActive = index === activeIndex;
            return (
              <div key={label} className="flex items-center gap-1">
                {index > 0 && <ChevronDown className="size-3 rotate-90 text-muted-foreground/40" />}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                    isDone && "border-primary/40 bg-primary/10 text-primary",
                    isActive && !isDone && "border-primary bg-primary text-primary-foreground",
                    !isActive && !isDone && "border-border text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* جسم الشاشة */}
        <div className="px-5 py-5">
          {phase === "question" && (
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="size-4 text-primary" />
                التقييم القبلي
              </p>
              <p className="mb-4 text-sm leading-relaxed">
                ما إعراب «المبتدأ» في جملة «المبتدأ يبدأ الجملة الاسمية»؟
              </p>
              <div className="flex flex-col gap-2" role="radiogroup" aria-label="سؤال تجريبي">
                {DEMO_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected === option}
                    onClick={() => {
                      setSelected(option);
                      setPhase("feedback");
                    }}
                    className={cn(
                      "rounded-xl border bg-background px-3 py-2 text-start text-sm font-medium transition-all",
                      "hover:border-primary/40 hover:bg-accent/40",
                      selected === option && "border-primary text-primary",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "feedback" && (
            <div className="flex flex-col gap-4">
              <p className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm leading-relaxed text-primary">
                {FEEDBACK_MESSAGE}
              </p>
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Play className="size-4 text-primary" />
                  اليوم سنتعلم
                </p>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                  المبتدأ اسم مرفوع يبدأ به الكلام... سنشرحه فقرة فقرة.
                </p>
                <Button
                  size="lg"
                  className="h-11 w-full"
                  onClick={() => setPhase("lesson")}
                >
                  التالي
                  <ArrowLeft className="size-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {phase === "lesson" && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Check className="size-4 text-primary" />
                أحسنت، فهمت الفقرة الأولى.
              </p>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                هكذا نمضي معك: فهمت ← انتقلت. لا تنتقل إلى فقرة جديدة قبل أن
                تتأكد أنك فهمت السابقة.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* بطاقة التحسن (قبل/بعد) */}
      <div className="mt-3 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 space-y-2.5">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>قبل الدرس</span>
              <span>40%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[40%] rounded-full bg-muted-foreground/50" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>بعد الدرس</span>
              <span>90%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[90%] rounded-full bg-primary" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Sparkles className="size-4" />
          +50% لقد تحسنت
        </div>
      </div>
    </div>
  );
}
