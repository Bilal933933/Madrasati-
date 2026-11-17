import type { LabDefinition } from "../engine/types";
import { LABS } from "./labs";

/**
 * "باك" موك داخل البيئة المعزولة: وعد محلي بتأخير ثابت، بلا fetch وبلا شبكة.
 * يحاكي شكل الاستجابة الحقيقي (تحميل ← بيانات) لاختبار الهياكل العظمية.
 */

const MOCK_LATENCY_MS = 220;

export function listLabs(): LabDefinition[] {
  return LABS;
}

export function getLabMock(id: string): Promise<LabDefinition | null> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(LABS.find((lab) => lab.id === id) ?? null);
    }, MOCK_LATENCY_MS);
  });
}
