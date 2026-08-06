import { ChoiceOption } from "./choice-option";
import { ExplanationCard } from "./explanation-card";
import { FeedbackBubble } from "./feedback-bubble";
import { HintReveal } from "./hint-reveal";
import { QuestionHeader } from "./question-header";

type OptionState = "idle" | "correct" | "wrong";

/** الشكل الهيكلي للسؤال الذي تُبنى عليه البطاقة — لا يرتبط بعقد الباك. */
interface QuestionShape {
  id: number;
  type: "mcq" | "true_false";
  content: string;
  explanation?: string | null;
  options?: { id: number; content: string }[];
}

interface QuestionCardProps {
  question: QuestionShape;
  /** ما اختاره الطالب — null قبل الاختيار */
  selectedOption: number | null;
  /** هل أُجيب السؤال وعُرضت التغذية؟ */
  revealed: boolean;
  /** خيارات صحيحة (تُمرَّر بعد التغذية فقط لتلوينها) */
  correctOption?: number | null;
  index?: number;
  total?: number;
  hint?: string;
  hintOpen: boolean;
  onSelectOption: (optionId: number) => void;
  onToggleHint: () => void;
  children?: React.ReactNode;
}

export type { QuestionCardProps };

/**
 * بطاقة السؤال — حاضن موحّد يُستخدم في التقييم القبلي، تحقق الفهم،
 * والاختبار النهائي. غير محكم: الحالة كاملة في المتصل.
 * MCQ يعرض ChoiceOption؛ صواب/خطأ يعرض زرّين مخصصين عبر children.
 */
export function QuestionCard({
  question,
  selectedOption,
  revealed,
  correctOption,
  hint,
  hintOpen,
  onSelectOption,
  onToggleHint,
  index = 0,
  total = 1,
  children,
}: QuestionCardProps) {
  const isMcq = question.type === "mcq";

  const optionState = (optionId: number): OptionState => {
    if (!revealed) {
      return "idle";
    }
    if (optionId === correctOption) {
      return "correct";
    }
    if (optionId === selectedOption && selectedOption !== correctOption) {
      return "wrong";
    }
    return "idle";
  };

  return (
    <div className="flex flex-col gap-5">
      <QuestionHeader index={index} total={total} typeLabel={isMcq ? "اختيار من متعدد" : "صواب وخطأ"} />

      <h2 className="text-lg font-bold leading-relaxed">{question.content}</h2>

      {hint && (
        <HintReveal hint={hint} open={hintOpen} onToggle={onToggleHint} />
      )}

      {isMcq ? (
        <div className="flex flex-col gap-2">
          {question.options?.map((option) => (
            <ChoiceOption
              key={option.id}
              option={option}
              selected={selectedOption === option.id}
              state={optionState(option.id)}
              disabled={revealed}
              onSelect={onSelectOption}
            />
          ))}
        </div>
      ) : (
        children
      )}

      {revealed && (
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-col gap-3 duration-300">
          <FeedbackBubble
            tone={selectedOption === correctOption ? "success" : "neutral"}
          >
            {selectedOption === correctOption
              ? "أحسنت، هذه هي الإجابة الصحيحة."
              : "لا بأس، إليك الإجابة الصحيحة لنتأكد معًا."}
          </FeedbackBubble>

          {question.explanation && (
            <ExplanationCard tone={selectedOption === correctOption ? "success" : "neutral"}>
              {question.explanation}
            </ExplanationCard>
          )}
        </div>
      )}
    </div>
  );
}
