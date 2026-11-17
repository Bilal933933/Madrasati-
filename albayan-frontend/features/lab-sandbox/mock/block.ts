import type { LabKind } from "../engine/types";

/**
 * شكل "الكتلة" الذي سيصل لاحقاً من الـ Builder عند الدمج الحقيقي.
 * نسخة محلية متعمّدة: لا نستورد أنواع `lesson-builder` كي يبقى العزل تاماً.
 *
 * الدمج المستقبلي = إضافة "interactive_lab" إلى BuilderBlockKind + حالة في
 * stepFromBlock() + فرع في ContentStage — لا أكثر.
 */
export interface SandboxLabBlock {
  id: number;
  kind: "interactive_lab";
  sort_order: number;
  is_published: boolean;
  data: {
    lab: LabKind;
    variant?: "book" | "focus" | "compact";
  };
}

export const SANDBOX_LAB_BLOCK: SandboxLabBlock = {
  id: 9001,
  kind: "interactive_lab",
  sort_order: 1,
  is_published: true,
  data: { lab: "pendulum", variant: "book" },
};
