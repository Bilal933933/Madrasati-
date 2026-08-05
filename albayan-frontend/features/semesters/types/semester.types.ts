export interface Semester {
  id: number;
  grade_id: number;
  name: string;
  sort_order: number | null;
}

export interface SemesterPayload {
  grade_id: number;
  name: string;
  sort_order?: number | null;
}

export interface SemesterListResponse {
  data: Semester[];
}

export interface SemesterMutationResponse {
  data: Semester;
  message: string;
}

export interface SemesterDeleteResponse {
  message: string;
}
