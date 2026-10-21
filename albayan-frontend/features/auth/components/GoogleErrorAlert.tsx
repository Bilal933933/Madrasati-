"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const MESSAGES: Record<string, string> = {
  google_failed: "تعذّر إتمام التسجيل عبر جوجل. تحقق من إعدادات المنصة وحاول مجددًا.",
  account_suspended: "هذا الحساب موقوف. تواصل مع إدارة المنصة.",
  // رسائل تشخيصية مؤقتة — تُزال بعد تحديد سبب الارتداد من الهوم
  home_ssr: "تشخيص: طرد من سيرفر الهوم (SSR 401 — الكوكي لم يصل للباك).",
  student_layout: "تشخيص: طرد من حارس العميل (لا يوجد مستخدم في المخزن).",
};

function GoogleErrorInner() {
  const params = useSearchParams();
  const error = params.get("error");
  const from = params.get("from");
  // تشخيص مؤقت: حالة HTTP من صفحة الـ callback — تُزال بعد تحديد السبب
  const cb = params.get("cb");
  const key = error ?? (from ? (from === "home_ssr" ? "home_ssr" : from === "student_layout" ? "student_layout" : null) : null);
  if (!key || !(key in MESSAGES)) return null;

  return (
    <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {MESSAGES[key]}
      {cb ? ` (callback: ${cb})` : null}
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
