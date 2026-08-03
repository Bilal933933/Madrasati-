export interface Grade {
  id: number;
  stage_id: number;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_published: boolean | null;
}

export interface GradePayload {
  stage_id: number;
  name: string;
  slug?: string | null;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
  is_published?: boolean | null;
}

export interface GradeListResponse {
  data: Grade[];
}

export interface GradeMutationResponse {
  data: Grade;
  message: string;
}

export interface GradeDeleteResponse {
  message: string;
}
