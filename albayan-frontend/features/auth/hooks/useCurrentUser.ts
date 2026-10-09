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
    if (query.isSuccess && query.data) {
      setUser(query.data);
      setInitialized(true);
    }

    if (query.isError) {
      // لا نمسح مستخدمًا مسجلًا بسبب فشل إعادة جلب لاحق (سباق ما بعد الدخول).
      // التصفير فقط عندما لا يوجد مستخدم أصلًا (زائر حقيقي 401).
      const status = (query.error as { status?: number } | null)?.status;
      if (status === 401 && !useAuthStore.getState().user) {
        setUser(null);
      }
      setInitialized(true);
    }
  }, [query.isSuccess, query.isError, query.data, query.error, setUser, setInitialized]);

  return query;
}
