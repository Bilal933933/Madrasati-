import { useQuery } from "@tanstack/react-query";
import { studentHomeApi } from "../services/studentHomeApi";

/** سجل الدروس المكتملة للطالب — يُستخدم في لوحة "نتائجي". */
export function useCompletedLessons() {
  return useQuery({
    queryKey: ["completed-lessons"],
    queryFn: () => studentHomeApi.completedLessons(),
  });
}
