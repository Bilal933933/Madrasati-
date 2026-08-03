import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

export function useRegister() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء الحساب بنجاح.");
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
    onError: (error) => {
      const message = (error as { message?: string })?.message;
      toast.error(message ?? "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.");
    },
  });
}
