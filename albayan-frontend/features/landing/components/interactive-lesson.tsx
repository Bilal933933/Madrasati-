"use client";

import { Check, ChevronDown, FileText, HelpCircle, Play } from "lucide-react";
import Link from "next/link";
import { AutoDemo } from "./auto-demo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * قسم "داخل الدرس": شاشة درس مصغّرة تتحرك وحدها في حلقة زمنية
 * (فقرة ← سؤال ← إجابة ← أحسنت ← فقرة تالية) دون نقر من الزائر،
 * ليشعر أن الدرس حيّ. يمكن التفاعل اليدوي عبر "التالي".
 */
export function InteractiveLesson() {
  const lessonSteps = [
    <LessonBody
      key="p1"
      step={0}
      title="الفقرة الأولى"
      text="المبتدأ اسم مرفوع يقع في بداية الجملة الاسمية، مثل: الطالبُ مجتهد."
    />,
    <LessonBody
      key="q1"
      step={1}
      title="سؤال"
      text="ما إعراب «المبتدأ» في جملة «الطالبُ مجتهد»؟"
      options={["مبتدأ مرفوع", "خبر منصوب", "فعل ماضٍ"]}
    />,
    <LessonBody
      key="a1"
      step={2}
      title="إجابة"
      text="أحسنت! المبتدأ مرفوع دائمًا. الآن فهمت الفقرة الأولى."
      success
    />,
    <LessonBody
      key="p2"
      step={3}
      title="الفقرة الثانية"
      text="الخبر يُكمل معنى الجملة مع المبتدأ، مثل: الطالبُ مجتهدٌ."
    />,
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          شاهد كيف يسير الدرس
        </h2>
        <p className="mt-3 text-muted-foreground">
          الدرس يتحرك أمامك — بدون تسجيل، بدون انتظار.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-xl overflow-hidden rounded-3xl border bg-card shadow-lg shadow-primary/5">
        {/* رأس الشاشة */}
        <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">درس حيّ</p>
            <h3 className="font-bold">المبتدأ والخبر</h3>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            ⏱ 18 دقيقة
          </span>
        </div>

        {/* جسم الدرس المتحرك */}
        <div className="p-5 sm:p-6">
          <AutoDemo steps={lessonSteps} interval={4500} />
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-2">
        <Button asChild size="lg" className="h-12 w-full px-6 text-base">
          <Link href="/trial">
            ابدأ التجربة
            <Play className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          فقرة واحدة + سؤالان — دون تسجيل
        </span>
      </div>
    </section>
  );
}

interface LessonBodyProps {
  step: number;
  title: string;
  text: string;
  options?: string[];
  success?: boolean;
}

function LessonBody({ step, title, text, options, success }: LessonBodyProps) {
  const isQuestion = options !== undefined;
  return (
    <div className="min-h-52">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isQuestion ? <HelpCircle className="size-4" /> : success ? <Check className="size-4" /> : <FileText className="size-4" />}
        </span>
        <div>
          <p className="text-xs text-muted-foreground">الخطوة {step + 1}</p>
          <p className="font-semibold">{title}</p>
        </div>
      </div>

      <p className={cn("mb-5 leading-relaxed", success ? "font-medium text-primary" : "text-muted-foreground")}>
        {text}
      </p>

      {isQuestion ? (
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center justify-between rounded-xl border bg-background px-4 py-2.5 text-sm"
            >
              {option}
              <span className="flex size-5 items-center justify-center rounded-full border text-muted-foreground">
                <span className="size-2 rounded-full bg-current" />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Button size="lg" className="h-11 w-full">
          {success ? "لننتقل إلى الفقرة التالية" : "التالي"}
          <ChevronDown className="size-4 rtl:rotate-180" />
        </Button>
      )}

      {success && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Play className="size-4 text-primary" />
          الدرس يتقدم تلقائيًا — جرّب المتابعة دون تسجيل.
        </p>
      )}
    </div>
  );
}
