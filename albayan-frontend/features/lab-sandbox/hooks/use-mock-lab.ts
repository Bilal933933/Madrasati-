"use client";

import { useEffect, useState } from "react";
import type { LabDefinition } from "../engine/types";
import { getLabMock } from "../mock/mock-api";

interface MockLabState {
  lab: LabDefinition | null;
  isLoading: boolean;
}

/**
 * يقرأ المختبر من الباك الموك المحلي.
 * لا TanStack Query هنا بقصد: بيانات ثابتة داخل البيئة المعزولة، ولا نريد
 * تسجيل مفاتيح وهمية في مخزن الاستعلامات الحقيقي.
 *
 * الحالة محفوظة بمعرّفها: أي تغيير للمعرّف يجعل النتيجة قديمة فوراً بلا setState
 * متزامن داخل الأثر.
 */
export function useMockLab(labId: string): MockLabState {
  const [loaded, setLoaded] = useState<{ id: string; lab: LabDefinition | null } | null>(null);

  useEffect(() => {
    let active = true;

    getLabMock(labId).then((lab) => {
      if (active) setLoaded({ id: labId, lab });
    });

    return () => {
      active = false;
    };
  }, [labId]);

  const isCurrent = loaded?.id === labId;

  return {
    lab: isCurrent ? loaded.lab : null,
    isLoading: !isCurrent,
  };
}
