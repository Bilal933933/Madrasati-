import type { PaginationMeta } from "@/types/pagination";

export interface Subject {
  id: number;
  grade_id: number;
  semester_id: number | null;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_published: boolean | null;
}

export interface SubjectPayload {
  grade_id: number;
  semester_id?: number | null;
  name: string;
  slug?: string | null;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
  is_published?: boolean | null;
}

export interface SubjectListResponse {
  data: Subject[];
  meta: PaginationMeta;
}

export interface SubjectMutationResponse {
  data: Subject;
  message: string;
}

export interface SubjectDeleteResponse {
  message: string;
}
