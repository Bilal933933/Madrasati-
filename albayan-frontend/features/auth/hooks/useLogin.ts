import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تسجيل الدخول بنجاح.");
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
      router.push("/home");
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.")
      );
    },
  });
}
