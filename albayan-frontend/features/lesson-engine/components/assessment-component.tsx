"use client";

import { useState } from "react";
import { useLessonEngineStore } from "@/features/lesson-engine/engine/lesson-engine-store";
import type { AssessmentMode, LessonAssessmentData } from "@/features/lesson-engine/engine/types";
import { QuestionCard } from "@/features/assessments/components/question/question-card";
import { QuestionFooter } from "@/features/assessments/components/question/question-footer";
import { ProgressIndicator } from "@/features/assessments/components/question/progress-indicator";
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

/**
 * مكوّن التقييم الموحّد — سير أسئلة واحد للتقييم القبلي وتحقق الفهم
 * والاختبار النهائي؛ يتبدل السلوك عبر `mode` فقط (رسالة الطمأنة وحكم
 * الانتقال). في pre/understanding لا حكم؛ في final يتطلب إجابة صحيحة.
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

  return (
    <AssessmentSequence mode={mode} questions={questions} next={next} />
  );
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
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState<boolean[]>(() => questions.map(() => false));

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const correctOptionId = computeCorrectOptionId(question);

  if (!question) {
    return null;
  }

  const answerIsCorrect = isCorrect(question, selected);
  const finalRequiresCorrect = mode === "final";

  const proceed = () => {
    if (!isLast) {
      setCurrent((value) => value + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      next();
    }
  };

  const handleContinue = () => {
    if (finalRequiresCorrect && !answerIsCorrect) {
      // الاختبار النهائي: إجابة خاطئة تعيد نفس السؤال بعد عرض التغذية.
      setSelected(null);
      setRevealed(false);
      return;
    }
    setDone((previous) => {
      const copy = [...previous];
      copy[current] = true;
      return copy;
    });
    proceed();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <p className="text-lg font-bold">{MODE_LABELS[mode]}</p>
        {MODE_REASSURANCE[mode] && (
          <p className="text-sm text-muted-foreground">{MODE_REASSURANCE[mode]}</p>
        )}
      </div>

      <ProgressIndicator total={questions.length} current={current} done={done} />

      <QuestionCard
        question={question}
        selectedOption={selected}
        revealed={revealed}
        correctOption={correctOptionId}
        hintOpen={false}
        onSelectOption={(optionId) => {
          if (!revealed) {
            setSelected(optionId);
          }
        }}
        onToggleHint={() => {}}
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

      <div className="flex flex-col gap-2">
        {!revealed && (
          <QuestionFooter
            label="تحقق"
            disabled={selected === null}
            onClick={() => setRevealed(true)}
          />
        )}
        {revealed && (
          <QuestionFooter
            label={isLast ? (mode === "final" ? "إنهاء الاختبار" : "متابعة الدرس") : "التالي"}
            onClick={handleContinue}
          />
        )}
      </div>
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
              "h-12 text-base",
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
