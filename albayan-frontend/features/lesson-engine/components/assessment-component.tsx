"use client";

import { useEffect, useRef, useState } from "react";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import type { AssessmentMode, LessonAssessmentData } from "@/features/lesson-engine/engine/types";
import { QuestionCard } from "@/features/assessments/components/question/question-card";
import { ProgressIndicator } from "@/features/assessments/components/question/progress-indicator";
import { QuestionFooter } from "@/features/assessments/components/question/question-footer";
import { AssessmentFeedbackDialog } from "@/features/lesson-engine/components/assessment-feedback-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODE_LABELS: Record<AssessmentMode, string> = {
  pre: "التقييم القبلي",
  understanding: "تحقق من الفهم",
  final: "الاختبار النهائي",
};

const MODE_REASSURANCE: Record<AssessmentMode, string | null> = {
  pre: "لا توجد درجات هنا — سنعرف من أين نبدأ فحسب.",
  understanding: "سؤال قصير للتأكد من أنك فهمت الفكرة.",
  final: null,
};

// أسئلة صواب/خطأ لا تحمل options من الباك؛ نعرض صواب/خطأ كخيارين ثابتين محليًا.
const TRUE_OPTION_ID = 1;
const FALSE_OPTION_ID = 2;

// مهلة الانتقال التلقائي عند الإجابة الصحيحة (بالمللي ثانية) لقراءة التغذية.
const AUTO_ADVANCE_MS = 2800;

/**
 * مكوّن التقييم الموحّد — سير أسئلة واحد للتقييم القبلي وتحقق الفهم
 * والاختبار النهائي؛ يتبدل عبر `mode` فقط.
 *
 * التغذية الراجعة:
 * - إجابة صحيحة → ينتقل تلقائيًا بعد مهلة قصيرة ليقرأ الطالب التأكيد.
 * - إجابة خاطئة → خياران للطالب: [التالي] أو [العودة إلى الفقرة السابقة],
 *   فيبقى القرار بيده (رحلة تعلّم لا امتحان).
 */
export function AssessmentComponent() {
  const current = useLessonEngineStore((s) => s.current);
  const next = useLessonEngineStore((s) => s.next);

  const mode: AssessmentMode =
    current?.block?.kind === "pre_assessment"
      ? "pre"
      : current?.block?.kind === "final_assessment"
        ? "final"
        : "understanding";

  const assessment =
    current && current.content?.type === "assessment" ? current.content.data : null;
  const questions = assessment?.questions ?? [];

  if (!assessment || questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          لا توجد أسئلة في هذه المرحلة. يمكنك المتابعة.
        </p>
        <Button size="lg" className="h-12 w-full text-base" onClick={() => next()}>
          متابعة
        </Button>
      </div>
    );
  }

  return <AssessmentSequence mode={mode} questions={questions} next={next} />;
}

function AssessmentSequence({
  mode,
  questions,
  next,
}: {
  mode: AssessmentMode;
  questions: LessonAssessmentData["questions"];
  next: () => void;
}) {
  const back = useLessonEngineStore((s) => s.back);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState<boolean[]>(() => questions.map(() => false));

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const correctOptionId = computeCorrectOptionId(question);
  const answerIsCorrect = question ? isCorrect(question, selected) : false;
  // حارس يمنع التقدم المزدوج (زر «متابعة الآن» + المؤقت التلقائي).
  const advancedRef = useRef(false);

  useEffect(() => {
    advancedRef.current = false;
  }, [current]);

  const proceed = () => {
    if (!isLast) {
      setCurrent((value) => value + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      next();
    }
  };

  const markDoneAndProceed = () => {
    if (advancedRef.current) {
      return;
    }
    advancedRef.current = true;
    setDone((previous) => {
      const copy = [...previous];
      copy[current] = true;
      return copy;
    });
    proceed();
  };

  // التحقق: يكشف الإجابة في ديلوج التغذية الراجعة.
  const handleCheck = () => {
    if (selected === null || revealed) {
      return;
    }
    setRevealed(true);
  };

  // إجابة صحيحة → انتقال تلقائي بعد مهلة قصيرة لقراءة التغذية الراجعة.
  useEffect(() => {
    if (!question || !revealed || !answerIsCorrect) {
      return;
    }
    const timer = window.setTimeout(markDoneAndProceed, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, revealed, answerIsCorrect, current]);

  if (!question) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 py-4 sm:py-8">
      <div className="flex flex-col gap-1 text-center">
        <p className="text-xl font-bold">{MODE_LABELS[mode]}</p>
        {MODE_REASSURANCE[mode] && (
          <p className="text-sm text-muted-foreground">{MODE_REASSURANCE[mode]}</p>
        )}
      </div>

      {questions.length > 1 && (
        <ProgressIndicator total={questions.length} current={current} done={done} />
      )}

      <div className="w-full">
        <QuestionCard
          question={question}
          selectedOption={selected}
          revealed={revealed}
          correctOption={correctOptionId}
          inlineFeedback={false}
          onSelectOption={(optionId) => {
            if (!revealed) {
              setSelected(optionId);
            }
          }}
          index={current}
          total={questions.length}
        >
          <TrueFalsePicker
            selected={selected}
            revealed={revealed}
            correctOptionId={correctOptionId}
            onSelect={(optionId) => {
              if (!revealed) {
                setSelected(optionId);
              }
            }}
          />
        </QuestionCard>
      </div>

      {/* زر التحقق داخل الشاشة — التغذية والتوضيح يظهران في الديلوج بعده. */}
      {!revealed && (
        <QuestionFooter
          label="تحقق"
          disabled={selected === null}
          onClick={handleCheck}
        />
      )}

      <AssessmentFeedbackDialog
        open={revealed}
        correct={answerIsCorrect}
        mode={mode}
        isLast={isLast}
        explanation={question.explanation}
        onProceed={markDoneAndProceed}
        onBackToParagraph={() => back()}
      />
    </div>
  );
}

function computeCorrectOptionId(
  question: LessonAssessmentData["questions"][number] | undefined
): number | null {
  if (!question) {
    return null;
  }
  if (question.type === "mcq") {
    return question.correctOptionId ?? null;
  }
  return (question.correctAnswer ?? false) ? TRUE_OPTION_ID : FALSE_OPTION_ID;
}

function isCorrect(
  question: LessonAssessmentData["questions"][number],
  selected: number | null
): boolean {
  if (selected === null) {
    return false;
  }
  if (question.type === "mcq") {
    return question.correctOptionId === selected;
  }
  return (selected === TRUE_OPTION_ID) === (question.correctAnswer ?? false);
}

function TrueFalsePicker({
  selected,
  revealed,
  correctOptionId,
  onSelect,
}: {
  selected: number | null;
  revealed: boolean;
  correctOptionId: number | null;
  onSelect: (optionId: number) => void;
}) {
  const options = [
    { id: TRUE_OPTION_ID, label: "صواب" },
    { id: FALSE_OPTION_ID, label: "خطأ" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* قاعدة: الزر الإجرائي هنا مصمت (emerald-600) — يعادل CTA لا تلوين خيار. */}
      {options.map((option) => {
        const isSelected = selected === option.id;
        const isCorrectState = revealed && option.id === correctOptionId;
        const isWrong = revealed && isSelected && !isCorrectState;
        return (
          <Button
            key={option.id}
            type="button"
            variant={isCorrectState ? "default" : isWrong ? "destructive" : "outline"}
            className={cn(
              "h-16 text-base",
              isCorrectState && "bg-emerald-600 text-white hover:bg-emerald-600"
            )}
            disabled={revealed}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
