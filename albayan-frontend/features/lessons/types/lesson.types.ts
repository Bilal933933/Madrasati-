export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_published: boolean | null;
}

export interface LessonPayload {
  course_id: number;
  title: string;
  slug?: string | null;
  summary?: string | null;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
  is_published?: boolean | null;
}

export interface LessonListResponse {
  data: Lesson[];
}

export interface LessonMutationResponse {
  data: Lesson;
  message: string;
}

export interface LessonDeleteResponse {
  message: string;
}
