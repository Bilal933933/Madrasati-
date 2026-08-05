/**
 * عميل API مركزي للتواصل مع Laravel Backend
 *
 * ملاحظات مهمة:
 * - نستخدم Sanctum SPA Cookie Mode، لذا كل طلب يجب أن يرسل credentials: 'include'
 *   حتى تُرسَل الكوكيز (albayan-session و XSRF-TOKEN) تلقائيًا مع كل طلب.
 * - قبل أي طلب POST/PUT/DELETE، يجب استدعاء /sanctum/csrf-cookie أولًا
 *   حتى يحصل المتصفح على قيمة XSRF-TOKEN المطلوبة.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * قراءة قيمة كوكي معيّن من المتصفح (نحتاجها لقراءة XSRF-TOKEN يدويًا)
 */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

/**
 * يجلب كوكي CSRF من Laravel قبل أي عملية تُغيّر البيانات
 */
export async function ensureCsrfCookie(): Promise<void> {
  await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

interface RequestOptions extends RequestInit {
  withCsrf?: boolean;
}

/**
 * دالة الطلب الأساسية — تُستخدم من كل ملفات authApi وغيرها لاحقًا
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { withCsrf = false, headers, ...rest } = options;

  if (withCsrf) {
    await ensureCsrfCookie();
  }

  const xsrfToken = readCookie("XSRF-TOKEN");

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | {
          message?: string;
          errors?: Record<string, string[]> | null;
        }
      | null;

    const message =
      errorBody?.message ??
      "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";

    // جمع أخطاء الحقول في رسالة واحدة واضحة، مثل: "اسم المرحلة مطلوب، صيغة الرابط غير صحيحة."
    const fieldErrors = errorBody?.errors
      ? Object.values(errorBody.errors as Record<string, string[]>)
          .flat()
          .filter(Boolean)
          .join("، ")
      : "";

    throw {
      status: response.status,
      message: fieldErrors || message,
      errors: errorBody?.errors ?? null,
    };
  }

  // بعض الاستجابات (مثل logout) قد لا تحتوي جسمًا
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}
