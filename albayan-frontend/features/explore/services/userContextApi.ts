import { apiClient } from "@/lib/apiClient";
import type { ApiMessageResponse } from "@/features/auth/types/auth.types";

/**
 * سياق التصفح — يحدّث "آخر مادة استكشفها" للطالب المسجّل.
 * يُستخدم من صفحة المادة (SubjectPage) فقط؛ الزائر لا يُرسل شيئًا.
 */
export const userContextApi = {
  update: (subjectSlug: string) =>
    apiClient<ApiMessageResponse>("/api/user-context", {
      method: "POST",
      body: JSON.stringify({ subject_slug: subjectSlug }),
      withCsrf: true,
    }),
};
