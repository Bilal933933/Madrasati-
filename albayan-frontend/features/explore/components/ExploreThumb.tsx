import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { imageUrl } from "@/lib/image";

/**
 * صورة كيان الاستكشاف — تعرض الصورة (من الباك عبر imageUrl) إن وُجدت،
 * وإلا تُرجع البطاقة البديلة (أيقونة/لون). تُستخدم في البطاقات وصفحات المستويات.
 */
export function ExploreThumb({
  image,
  fallback,
  className,
  alt,
}: {
  image: string | null | undefined;
  /** واجهة البديل عند غياب الصورة — أي عنصر (صندوق أيقونة ملون مثلًا). */
  fallback: ReactNode;
  className?: string;
  alt?: string;
}) {
  const src = imageUrl(image);

  if (!src) {
    return fallback;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} className={cn("shrink-0 rounded-xl object-cover", className)} />
  );
}
