import { toast } from "sonner";

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]> | null;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "status" in error;
}

interface ApiErrorLike {
  status?: number;
  message?: string;
  errors?: Record<string, string[]> | null;
}

const NETWORK_MESSAGE = "تعذّر الاتصال بالخادم. تحقق من اتصالك وأعد المحاولة.";
const DEFAULT_MESSAGE = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";

export function getErrorMessage(
  error: unknown,
  fallback = DEFAULT_MESSAGE
): string {
  if (error instanceof TypeError) {
    return NETWORK_MESSAGE;
  }

  const apiError = error as ApiErrorLike;

  if (apiError?.errors && Object.keys(apiError.errors).length > 0) {
    return Object.values(apiError.errors)
      .flat()
      .filter(Boolean)
      .join("، ");
  }

  return apiError?.message ?? fallback;
}

export function showApiError(error: unknown, fallback?: string): void {
  toast.error(getErrorMessage(error, fallback));
}
