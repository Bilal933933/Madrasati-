import { useQuery } from "@tanstack/react-query";
import { trialApi } from "../services/trialApi";

/**
 * جلب النسخة التجريبية — درس مصغّر (فقرة + فيديو قصير + سؤالان) للزائر.
 */
export function useTrial() {
  return useQuery({
    queryKey: ["trial"],
    queryFn: () => trialApi.get(),
    retry: false,
  });
}
