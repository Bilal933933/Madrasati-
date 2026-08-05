import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clear = useAuthStore((state) => state.clear);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: (data) => {
      toast.success(data?.message ?? "تم تسجيل الخروج بنجاح.");
      clear();
      queryClient.clear();
      router.push("/login");
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "تعذر تسجيل الخروج. يرجى المحاولة مرة أخرى.")
      );
    },
  });
}
