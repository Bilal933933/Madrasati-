import { useQuery } from "@tanstack/react-query";
import { achievementsApi } from "../services/achievementsApi";

/** إنجازات الطالب مع التقدم وحالة الفتح — تُشاركها صفحة "إنجازاتي" وبطاقة الرئيسية. */
export function useStudentAchievements() {
  return useQuery({
    queryKey: ["student-achievements"],
    queryFn: () => achievementsApi.listStudent(),
  });
}