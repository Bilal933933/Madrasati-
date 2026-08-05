export interface Paragraph {
  id: number;
  lesson_id: number;
  title: string;
  type: string;
  slug: string | null;
  image: string | null;
  video: string | null;
  video_embed: string | null;
  icon: string | null;
  color: string | null;
  content: string;
  sort_order: number | null;
}

export interface ParagraphPayload {
  lesson_id: number;
  title: string;
  slug?: string | null;
  image?: string | null;
  video?: string | null;
  icon?: string | null;
  color?: string | null;
  content: string;
  sort_order?: number | null;
}

export interface ParagraphListResponse {
  data: Paragraph[];
}

export interface ParagraphMutationResponse {
  data: Paragraph;
  message: string;
}

export interface ParagraphDeleteResponse {
  message: string;
}

export interface NextParagraphOrderResponse {
  data: {
    next_order: number;
  };
}
