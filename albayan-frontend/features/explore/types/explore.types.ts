export interface ExploreStage {
  id: number;
  key: string;
  name: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  grades_count: number;
}

export interface ExploreGrade {
  id: number;
  key: string;
  name: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  semesters_count: number;
}

export interface ExploreSemester {
  id: number;
  key: string;
  name: string;
  subjects_count: number;
}

export interface ExploreSubjectSummary {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  icon: string | null;
  color: string | null;
  description: string;
  units_count: number;
  lessons_count: number;
}

export interface ExploreLesson {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  color: string | null;
  blocks_count: number;
  duration: number;
}

export interface ExploreUnit {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  color: string | null;
  lessons: ExploreLesson[];
}

export interface ExploreSubjectDetail extends ExploreSubjectSummary {
  units: ExploreUnit[];
}

export interface LessonPreview {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  subject: string | null;
  unit: string | null;
  description: string | null;
  learning_objectives: string[];
  blocks_count: number;
  assessment_count: number;
  duration: number;
}

export interface ExploreListResponse<T> {
  data: T[];
}

export interface ExploreItemResponse<T> {
  data: T;
}
