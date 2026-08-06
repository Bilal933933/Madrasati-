import { apiClient } from "@/lib/apiClient";
import type {
  ExploreGrade,
  ExploreItemResponse,
  ExploreListResponse,
  ExploreSemester,
  ExploreStage,
  ExploreSubjectDetail,
  ExploreSubjectSummary,
  LessonPreview,
} from "../types/explore.types";

const NO_STORE = { method: "GET", cache: "no-store" as const };

/**
 * واجهة قراءة الاستكشاف — مسارات عامة بلا تسجيل (الزائر).
 */
export const exploreApi = {
  stages: () => apiClient<ExploreListResponse<ExploreStage>>("/api/explore/stages", NO_STORE),

  grades: (stageKey: string) =>
    apiClient<ExploreListResponse<ExploreGrade>>(`/api/explore/stages/${stageKey}/grades`, NO_STORE),

  semesters: (stageKey: string, gradeKey: string) =>
    apiClient<ExploreListResponse<ExploreSemester>>(
      `/api/explore/stages/${stageKey}/grades/${gradeKey}/semesters`,
      NO_STORE
    ),

  subjects: (stageKey: string, gradeKey: string, semesterKey: string) =>
    apiClient<ExploreListResponse<ExploreSubjectSummary>>(
      `/api/explore/stages/${stageKey}/grades/${gradeKey}/semesters/${semesterKey}/subjects`,
      NO_STORE
    ),

  subject: (slug: string) =>
    apiClient<ExploreItemResponse<ExploreSubjectDetail>>(`/api/explore/subjects/${slug}`, NO_STORE),

  lessonPreview: (slug: string) =>
    apiClient<ExploreItemResponse<LessonPreview>>(`/api/lessons/${slug}/preview`, NO_STORE),
};
