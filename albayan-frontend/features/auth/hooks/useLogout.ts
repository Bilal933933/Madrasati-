import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

export function useLogout() {
  const queryClient = useQueryClient();
  const clear = useAuthStore((state) => state.clear);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: (data) => {
      toast.success(data?.message ?? "تم تسجيل الخروج بنجاح.");
      clear();
      queryClient.clear();
    },
    onError: (error) => {
      const message = (error as { message?: string })?.message;
      toast.error(message ?? "تعذر تسجيل الخروج. يرجى المحاولة مرة أخرى.");
    },
  });
}
