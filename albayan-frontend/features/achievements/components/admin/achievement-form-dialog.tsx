"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { IconSelect } from "@/components/shared/icon-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showApiError } from "@/lib/apiErrors";
import {
  useCreateAchievement,
  useUpdateAchievement,
} from "@/features/achievements/hooks/useAchievements";
import {
  ACHIEVEMENT_METRIC_LABELS,
  type AchievementDefinition,
  type AchievementMetric,
  type AchievementPayload,
} from "@/features/achievements/types/achievement.types";

type AchievementFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: AchievementDefinition | null;
};

type FormState = {
  metric: string;
  threshold: string;
  title: string;
  description: string;
  key: string;
  icon: string;
  sort_order: string;
  is_active: boolean;
};

export function AchievementFormDialog({
  open,
  onOpenChange,
  achievement,
}: AchievementFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <AchievementForm
            key={achievement?.id ?? "create"}
            achievement={achievement}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AchievementForm({
  achievement,
  onClose,
}: {
  achievement: AchievementDefinition | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    metric: achievement?.metric ?? "",
    threshold: achievement ? String(achievement.threshold) : "1",
    title: achievement?.title ?? "",
    description: achievement?.description ?? "",
    key: achievement?.key ?? "",
    icon: achievement?.icon ?? "",
    sort_order: achievement ? String(achievement.sort_order) : "",
    is_active: achievement?.is_active ?? true,
  }));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const createAchievement = useCreateAchievement();
  const updateAchievement = useUpdateAchievement();
  const isPending = createAchievement.isPending || updateAchievement.isPending;

  const isEdit = achievement !== null;

  function handleChange(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerErrors((prev) => {
      if (!prev || prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function fieldError(field: string) {
    return { message: serverErrors?.[field]?.[0] };
  }

  function buildPayload(): AchievementPayload | null {
    if (!form.metric) {
      setServerErrors({ metric: ["يرجى اختيار المقياس."] });
      showApiError({ message: "يرجى اختيار المقياس." });
      return null;
    }

    const threshold = Number(form.threshold);
    if (!form.threshold || !Number.isFinite(threshold) || threshold < 1) {
      setServerErrors({ threshold: ["العتبة يجب أن تكون 1 على الأقل."] });
      showApiError({ message: "العتبة يجب أن تكون 1 على الأقل." });
      return null;
    }

    return {
      metric: form.metric as AchievementMetric,
      threshold,
      title: form.title.trim(),
      description: form.description.trim() || null,
      key: form.key.trim() || undefined,
      icon: form.icon.trim() || null,
      sort_order: form.sort_order === "" ? undefined : Number(form.sort_order),
      is_active: form.is_active,
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErrors(null);

    const payload = buildPayload();
    if (!payload) return;

    if (isEdit && achievement) {
      updateAchievement.mutate(
        { id: achievement.id, payload },
        {
          onSuccess: onClose,
          onError: (error) =>
            setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
        }
      );
    } else {
      createAchievement.mutate(payload, {
        onSuccess: onClose,
        onError: (error) =>
          setServerErrors((error as { errors?: Record<string, string[]> })?.errors ?? null),
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "تعديل الإنجاز" : "إضافة إنجاز"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "عدّل بيانات الوسم ثم احفظ التغييرات."
            : "أدخل بيانات الوسم الجديد ثم احفظ."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="achievement-metric">المقياس *</FieldLabel>
            <FieldContent>
              <Select
                value={form.metric}
                onValueChange={(value) => handleChange("metric", value)}
              >
                <SelectTrigger id="achievement-metric" className="w-full">
                  <SelectValue placeholder="اختر المقياس..." />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(
                      ACHIEVEMENT_METRIC_LABELS
                    ) as AchievementMetric[]
                  ).map((metric) => (
                    <SelectItem key={metric} value={metric}>
                      {ACHIEVEMENT_METRIC_LABELS[metric]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldError("metric")]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="achievement-threshold">العتبة *</FieldLabel>
            <FieldContent>
              <Input
                id="achievement-threshold"
                type="number"
                min={1}
                value={form.threshold}
                onChange={(e) => handleChange("threshold", e.target.value)}
                className="h-9"
              />
              <FieldError errors={[fieldError("threshold")]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="achievement-title">عنوان الإنجاز *</FieldLabel>
          <FieldContent>
            <Input
              id="achievement-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              className="h-9"
            />
            <FieldError errors={[fieldError("title")]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="achievement-description">الوصف</FieldLabel>
          <FieldContent>
            <Textarea
              id="achievement-description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
            <FieldError errors={[fieldError("description")]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="achievement-icon">الأيقونة</FieldLabel>
            <FieldContent>
              <IconSelect
                id="achievement-icon"
                value={form.icon}
                onValueChange={(value) => handleChange("icon", value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="achievement-order">الترتيب</FieldLabel>
            <FieldContent>
              <Input
                id="achievement-order"
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => handleChange("sort_order", e.target.value)}
                className="h-9"
              />
              <FieldError errors={[fieldError("sort_order")]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="achievement-key">المفتاح (Key)</FieldLabel>
          <FieldContent>
            <Input
              id="achievement-key"
              value={form.key}
              onChange={(e) => handleChange("key", e.target.value)}
              placeholder="first-lesson"
              className="h-9 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              اتركه فارغًا ليولَّد تلقائيًا.
            </p>
            <FieldError errors={[fieldError("key")]} />
          </FieldContent>
        </Field>

        <Field>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={form.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked === true)}
            />
            مفعّل
          </label>
        </Field>

        {serverErrors && Object.keys(serverErrors).length > 0 && (
          <FieldError
            errors={Object.values(serverErrors).map((msg) => ({ message: msg?.[0] }))}
          />
        )}

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner />}
            {isPending ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}