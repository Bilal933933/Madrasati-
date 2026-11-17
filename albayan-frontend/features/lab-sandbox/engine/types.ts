import type * as THREE from "three";

/**
 * بيئة معزولة (Sandbox) — عقد المختبر ثلاثي الأبعاد.
 *
 * كل ما في هذا المجلد إضافي ولا يعتمد على `lesson-engine` أو `lib/` أو الباك.
 * الغرض: تجربة دمج مختبر فيزيائي 3D في محرك الدرس دون أي أثر على المشروع.
 */

/** الزوايا الأولى للكاميرا (موضع + نقطة نظر) */
export interface LabFraming {
  position: [number, number, number];
  target: [number, number, number];
}

export interface LabInfoItem {
  label: string;
  value: string;
}

/** قراءة واحدة من المحاكاة — تُعرض في الأعمدة والشرائح */
export interface LabReadout {
  ep: number;
  ek: number;
  et: number;
  /** مرجع التطبيع: كل الأعمدة تُقاس عليه فتصبح Ep + Ek = Et */
  ref: number;
  info: LabInfoItem[];
}

export type LabFormulaTone = "blue" | "green" | "purple" | "amber";

export interface LabFormula {
  tag: string;
  tone: LabFormulaTone;
  label: string;
  latex: string;
  note: string;
}

export interface LabControlSpec {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  color: string;
  format: (value: number) => string;
}

export interface LabQuiz {
  question: string;
  answer: string;
}

export type LabKind = "pendulum" | "ramp" | "spring";

/** تعريف مختبر واحد كما يصل من الباك الموك */
export interface LabDefinition {
  id: LabKind;
  label: string;
  badge: string;
  pageRef: string;
  title: string;
  intro: string;
  formulas: LabFormula[];
  banner: { label: string; latex: string };
  quiz: LabQuiz;
  controls: LabControlSpec[];
}

/** جسر يمنحه المسرح للمحاكاة (تقاطعات المؤشر فقط) */
export interface LabSceneBridge {
  readonly canvas: HTMLCanvasElement;
  hits(event: PointerEvent, object: THREE.Object3D): boolean;
  intersectZ0(event: PointerEvent): THREE.Vector3 | null;
  setDragLock(locked: boolean): void;
}

/** عقد المحاكاة الفيزيائية — لا تعرف React ولا المحرك */
export interface LabSim {
  group: THREE.Group;
  framing: LabFraming;
  update(dt: number): void;
  readout(): LabReadout;
  reset(): void;
  setParam(id: string, value: number): void;
  dispose(): void;
}
