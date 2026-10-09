"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const MESSAGES: Record<string, string> = {
  google_failed: "تعذّر إتمام التسجيل عبر جوجل. تحقق من إعدادات المنصة وحاول مجددًا.",
  account_suspended: "هذا الحساب موقوف. تواصل مع إدارة المنصة.",
};

function GoogleErrorInner() {
  const error = useSearchParams().get("error");
  if (!error || !(error in MESSAGES)) return null;

  return (
    <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {MESSAGES[error]}
    </p>
  );
}

export function GoogleErrorAlert() {
  return (
    <Suspense fallback={null}>
      <GoogleErrorInner />
    </Suspense>
  );
}
