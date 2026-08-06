interface QuestionHeaderProps {
  index: number;
  total: number;
  typeLabel: string;
}

/**
 * رأس السؤال: ترقيمه ونوعه («سؤال سريع»، «اختيار من متعدد»...).
 */
export function QuestionHeader({ index, total, typeLabel }: QuestionHeaderProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-semibold">{typeLabel}</span>
      <span className="text-muted-foreground">
        سؤال {index + 1} من {total}
      </span>
    </div>
  );
}