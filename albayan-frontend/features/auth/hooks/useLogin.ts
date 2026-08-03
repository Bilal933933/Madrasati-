import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تسجيل الدخول بنجاح.");
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
    onError: (error) => {
      const message = (error as { message?: string })?.message;
      toast.error(message ?? "تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    },
  });
}
