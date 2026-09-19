export interface AnalyticsCounts {
  students: number;
  teachers: number;
  admins: number;
  lessons: number;
  courses: number;
  completed_lessons: number;
  completion_rate_percent: number;
  exam_attempts: number;
  exams_passed: number;
  avg_score_percent: number;
  achievements_unlocked: number;
}

export interface MonthlyActivityItem {
  month: string;
  completed_lessons: number;
  exam_attempts: number;
}

export interface AnalyticsSummary {
  counts: AnalyticsCounts;
  monthly: MonthlyActivityItem[];
}

export interface AnalyticsSummaryResponse {
  data: AnalyticsSummary;
}