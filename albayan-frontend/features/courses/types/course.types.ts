export interface Course {
  id: number;
  section_id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_published: boolean | null;
}

export interface CoursePayload {
  section_id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
  is_published?: boolean | null;
}

export interface CourseListResponse {
  data: Course[];
}

export interface CourseMutationResponse {
  data: Course;
  message: string;
}

export interface CourseDeleteResponse {
  message: string;
}
