import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

/**
 * يُستخدم مرة واحدة عند تحميل التطبيق (مثلًا داخل Providers/Layout)
 * للتحقق: هل يوجد جلسة (Cookie) صالحة؟
 */
export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  const query = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: authApi.getCurrentUser,
    retry: false, // لا داعي لإعادة المحاولة إن كان 401 (غير مسجل دخول)
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.isSuccess && query.data?.name) {
      setUser(query.data);
      setInitialized(true);
    }

    if (query.isError) {
      setUser(null);
      setInitialized(true);
    }
  }, [query.isSuccess, query.isError, query.data, setUser, setInitialized]);

  return query;
}
