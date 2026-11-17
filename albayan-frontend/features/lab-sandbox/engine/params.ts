import type { LabControlSpec } from "./types";

/** يحوّل مخطط المنزلقات إلى قيم ابتدائية { id: value } */
export function toParamValues(controls: LabControlSpec[]): Record<string, number> {
  const values: Record<string, number> = {};
  for (const control of controls) values[control.id] = control.value;
  return values;
}

/** يقرأ قيمة معامل مع حد أدنى/أعلى آمن */
export function param(values: Record<string, number>, id: string, fallback: number): number {
  const value = values[id];
  return Number.isFinite(value) ? value : fallback;
}
