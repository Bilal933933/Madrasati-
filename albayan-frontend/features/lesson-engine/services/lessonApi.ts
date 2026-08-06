import { apiClient } from "@/lib/apiClient";
import type { LessonFlowResponse } from "@/features/lesson-builder/types/lesson-builder.types";

export const lessonApi = {
  getBySlug: (slug: string) =>
    apiClient<LessonFlowResponse>(`/api/lessons/${slug}`, {
      method: "GET",
    }),
};
