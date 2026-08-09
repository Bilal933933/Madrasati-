export type AchievementMetric =
  | "lessons_completed"
  | "courses_completed"
  | "exams_passed"
  | "correct_answers"
  | "streak_days";

export const ACHIEVEMENT_METRIC_LABELS: Record<AchievementMetric, string> = {
  lessons_completed: "دروس مكتملة",
  courses_completed: "مقررات مكتملة",
  exams_passed: "اختبارات ناجحة",
  correct_answers: "أسئلة صحيحة",
  streak_days: "أيام متتالية",
};

export const ACHIEVEMENT_METRICS = Object.keys(
  ACHIEVEMENT_METRIC_LABELS
) as AchievementMetric[];

/** تعريف الإنجاز — من واجهة الإدارة أو القائمة المفتوحة. */
export interface AchievementDefinition {
  id: number;
  key: string;
  metric: AchievementMetric;
  metric_label: string;
  threshold: number;
  title: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

/** إنجاز من قائمة الطالب — التقدم والحالة فوق التعريف. */
export interface AchievementProgress extends AchievementDefinition {
  progress: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface AchievementListResponse {
  data: AchievementProgress[];
}

export interface AdminAchievementListResponse {
  data: AchievementDefinition[];
}

export interface AchievementMutationResponse {
  data: AchievementDefinition;
  message: string;
}

export interface AchievementDeleteResponse {
  message: string;
}

/** الأوسمة المفتوحة في استجابات اللحظات الفارقة (إكمال درس / تسليم اختبار). */
export interface AchievementUnlocksPayload {
  unlocked_achievements?: AchievementDefinition[];
}

export interface AchievementPayload {
  key?: string;
  metric: AchievementMetric;
  threshold: number;
  title: string;
  description?: string | null;
  icon?: string | null;
  is_active?: boolean;
  sort_order?: number;
}