export type LabVariant = "book" | "focus" | "compact";

export interface LabVariantOption {
  id: LabVariant;
  label: string;
  hint: string;
}

export const LAB_VARIANTS: LabVariantOption[] = [
  { id: "book", label: "كتاب مفتوح", hint: "شرح يمين + مشهد يسار" },
  { id: "focus", label: "تركيز", hint: "مشهد واسع + شرح أسفله" },
  { id: "compact", label: "مدمج", hint: "بعرض LessonShell (42rem)" },
];

export function parseVariant(value?: string): LabVariant {
  const match = LAB_VARIANTS.find((variant) => variant.id === value);
  return match?.id ?? "book";
}
