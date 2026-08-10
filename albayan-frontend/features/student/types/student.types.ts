export type ProgressStatus = "not_started" | "in_progress" | "completed";

/** درس (معاينة قصيرة) — تُستخدم لحقول آخر/قادم درس وقوائم دروس المقرر. */
export interface LessonPreview {
  id: number;
  slug: string;
  title: string;
  image?: string | null;
  color?: string | null;
  summary?: string | null;
  blocks_count?: number;
  duration?: number | null;
}

/** حقول تقدّم مشتقة من سجلات إكمال الطالب (lesson_completions). */
export interface ProgressFields {
  progress: number;
  status: ProgressStatus;
  completed_count: number;
  total_count: number;
  last_lesson: LessonPreview | null;
  next_lesson: LessonPreview | null;
  last_visited_at: string | null;
}

export interface StudentSubject extends ProgressFields {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  description: string;
  units_count: number;
  lessons_count: number;
  grade_key: string;
  semester_key: string;
}

export interface StudentHomeData {
  student: {
    name: string;
  };
  grade: {
    key: string;
    name: string;
    image?: string | null;
    icon?: string | null;
  };
  semester: {
    key: string;
    name: string;
  };
academic_year: string;
  overall_progress: number;
  subjects: StudentSubject[];
}

/** مقرر داخل صفحة المادة (Unit) مع تقدّمه ودروسه. */
export interface StudentUnit extends ProgressFields {
  id: number;
  slug: string;
  name: string;
  description: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  lessons: LessonPreview[];
}

export interface StudentSubjectDetail {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  description: string;
  units_count: number;
  lessons_count: number;
  grade: {
    key: string;
    name: string;
  };
  semester: {
    key: string;
    name: string;
  };
  progress: number;
  status: ProgressStatus;
  completed_count: number;
  total_count: number;
  last_lesson: LessonPreview | null;
  next_lesson: LessonPreview | null;
  last_visited_at: string | null;
  units: StudentUnit[];
}

export interface StudentHomeResponse {
  data: StudentHomeData;
}

export interface StudentSubjectResponse {
  data: StudentSubjectDetail;
}

/** درس داخل صفحة المقرر مع حالة إكماله/بدئه للمستخدم الحالي. */
export interface StudentCourseLesson extends LessonPreview {
  completed: boolean;
  started_at: string | null;
  learning_objectives?: string[] | null;
}

export interface StudentCourseDetail {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  color: string | null;
  subject: {
    id: number;
    slug: string;
    name: string;
  };
  progress: number;
  status: ProgressStatus;
  completed_count: number;
  total_count: number;
  last_lesson: LessonPreview | null;
  next_lesson: LessonPreview | null;
  last_visited_at: string | null;
  lessons: StudentCourseLesson[];
}

export interface StudentCourseResponse {
  data: StudentCourseDetail;
}

/** درس مكتمل ضمن سجل نتائج الطالب — مادة/مقرر/تاريخ الإكمال. */
export interface CompletedLesson {
  id: number;
  lesson: LessonPreview;
  subject: {
    id: number;
    slug: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  course_name: string;
  completed_at: string;
}

export interface CompletedLessonsStats {
  total: number;
  subjects_count: number;
}

export interface CompletedLessonsResponse {
  data: CompletedLesson[];
  stats: CompletedLessonsStats;
}
