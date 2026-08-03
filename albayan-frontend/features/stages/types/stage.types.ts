export interface Stage {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_published: boolean | null;
}

export interface StagePayload {
  name: string;
  slug?: string | null;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
  is_published?: boolean | null;
}

export interface StageListResponse {
  data: Stage[];
}

export interface StageMutationResponse {
  data: Stage;
  message: string;
}

export interface StageDeleteResponse {
  message: string;
}
