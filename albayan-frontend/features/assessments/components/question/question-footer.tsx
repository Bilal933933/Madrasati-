import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionFooterProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * زر الإجراء السفلي للسؤال («تحقق»، «التالي»، «إنهاء»...) — موحّد الشكل.
 */
export function QuestionFooter({ label, onClick, disabled = false }: QuestionFooterProps) {
  return (
    <Button size="lg" className="h-12 w-full text-base" onClick={onClick} disabled={disabled}>
      {label}
      <ArrowLeft aria-hidden />
    </Button>
  );
}