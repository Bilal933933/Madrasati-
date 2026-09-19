export interface AiAdminStats {
  totalThreads: number;
  totalMessages: number;
  activeStudents: number;
}

export interface AiAdminThreadListItem {
  id: string;
  title: string | null;
  subjectId: string | null;
  lessonId: string | null;
  student: { id: string; name: string; email: string };
  messageCount: number;
  updatedAt: string | null;
}

export interface AiAdminThreadList {
  data: AiAdminThreadListItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface AiAdminMessage {
  id: string;
  thread_id: string;
  sender: string;
  kind: string;
  content: string;
  metadata: unknown;
  created_at: string;
}

export interface AiAdminThreadDetail {
  id: string;
  title: string | null;
  subjectId: string | null;
  lessonId: string | null;
  student: { id: string; name: string; email: string };
  createdAt: string | null;
  updatedAt: string | null;
  messages: AiAdminMessage[];
}