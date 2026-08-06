import type { LessonEngineData, LessonFlowStep } from "./types";

/**
 * محرك الدرس — منفّذ بسيط. يستلم `flow` (شاشات الطالب الأربع) ومؤشرًا،
 * وينتقل بينها فقط عبر `next()/back()`. يعرض الشاشة الحالية ولا يعرف مصدرها.
 * أي نشر (بوابة فحص، حدث، حفظ نقطة) يُدار من المكونات العليا حسب الحاجة.
 */
export class LessonEngine {
  private readonly flowData: LessonFlowStep[];
  private pointer = 0;

  constructor(data: LessonEngineData) {
    this.flowData = data.flow;
  }

  get current(): LessonFlowStep | null {
    return this.flowData[this.pointer] ?? null;
  }

  get currentIndex(): number {
    return this.pointer;
  }

  get total(): number {
    return this.flowData.length;
  }

  get flow(): LessonFlowStep[] {
    return this.flowData;
  }

  get hasNext(): boolean {
    return this.pointer < this.flowData.length - 1;
  }

  get hasPrev(): boolean {
    return this.pointer > 0;
  }

  /** ينتقل للشاشة التالية إن وُجدت. */
  next(): boolean {
    if (!this.hasNext) {
      return false;
    }
    this.pointer += 1;
    return true;
  }

  /** يرجع للشاشة السابقة إن وُجدت. */
  back(): boolean {
    if (!this.hasPrev) {
      return false;
    }
    this.pointer -= 1;
    return true;
  }

  /** يقفز مباشرة إلى شاشة بمعرّفها (استئناف التقدم المحفوظ). */
  jumpTo(stepId: string): boolean {
    const index = this.flowData.findIndex((step) => step.id === stepId);
    if (index === -1) {
      return false;
    }
    this.pointer = index;
    return true;
  }
}
