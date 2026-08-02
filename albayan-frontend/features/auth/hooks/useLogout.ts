import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

export function useLogout() {
  const queryClient = useQueryClient();
  const clear = useAuthStore((state) => state.clear);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clear();
      queryClient.clear();
    },
  });
}
