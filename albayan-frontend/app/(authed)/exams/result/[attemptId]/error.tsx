"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

export default function ResultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="تعذّر عرض النتيجة"
    />
  );
}