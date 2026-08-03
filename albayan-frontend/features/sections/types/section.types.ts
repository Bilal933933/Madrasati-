export interface Section {
  id: number;
  subject_id: number;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_published: boolean | null;
}

export interface SectionPayload {
  subject_id: number;
  name: string;
  slug?: string | null;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
  is_published?: boolean | null;
}

export interface SectionListResponse {
  data: Section[];
}

export interface SectionMutationResponse {
  data: Section;
  message: string;
}

export interface SectionDeleteResponse {
  message: string;
}
