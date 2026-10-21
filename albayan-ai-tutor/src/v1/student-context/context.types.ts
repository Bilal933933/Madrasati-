/**
 * صورة الطالب الكاملة التي تُبنى من PostgreSQL مباشرة.
 * كل المعرّفات أرقام (BigInt يحوَّل إلى Number) حتى يسهل تسلسلها JSON
 * وإرسالها عبر الـ WebSocket إلى المعلم الذكي.
 */
export interface StudentContext {
  student: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  placement: {
    gradeId: number | null;
    gradeName: string | null;
    stageName: string | null;
    semesterName: string | null;
    currentSubjectId: number | null;
    currentSubjectName: string | null;
  };
  progress: {
    completedCount: number;
    perSubject: {
      subjectId: number;
      subjectName: string;
      completed: number;
    }[];
    lastLesson: {
      id: number;
      title: string;
      courseName: string;
    } | null;
    dailyStreak: number;
  };
  performance: {
    attemptsCount: number;
    passedCount: number;
    averageScore: number | null;
    bestScore: number | null;
    weakestExamType: string | null;
  };
  weakAreas: {
    lessonId: number;
    lessonTitle: string;
    errorCount: number;
  }[];
  achievements: {
    id: number;
    title: string;
    unlockedAt: string | null;
  }[];
}
