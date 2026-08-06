import { apiClient } from "@/lib/apiClient";
import type { LessonFlowResponse } from "@/features/lesson-builder/types/lesson-builder.types";

/**
 * واجهة النسخة التجريبية — مسار عام بلا تسجيل.
 */
export const trialApi = {
  get: () =>
    apiClient<LessonFlowResponse>("/api/trial", {
      method: "GET",
      cache: "no-store",
    }),
};
