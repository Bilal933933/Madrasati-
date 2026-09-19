"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { showApiError } from "@/lib/apiErrors";
import {
  usePlatformSettings,
  useUpdatePlatformSettings,
} from "@/features/settings/hooks/useSettings";
import type { PlatformSettings } from "@/features/settings/types/settings.types";

type FormState = {
  site_name: string;
  site_logo: string;
  welcome_message: string;
  maintenance_mode: boolean;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_youtube: string;
};

const STRING_FIELDS = [
  "site_name",
  "site_logo",
  "welcome_message",
  "social_facebook",
  "social_twitter",
  "social_instagram",
  "social_youtube",
] as const;

type StringField = (typeof STRING_FIELDS)[number];

function toForm(settings: PlatformSettings): FormState {
  return {
    site_name: settings.site_name,
    site_logo: settings.site_logo ?? "",
    welcome_message: settings.welcome_message ?? "",
    maintenance_mode: settings.maintenance_mode,
    social_facebook: settings.social_facebook ?? "",
    social_twitter: settings.social_twitter ?? "",
    social_instagram: settings.social_instagram ?? "",
    social_youtube: settings.social_youtube ?? "",
  };
}

function SocialLinksCard({
  form,
  onFieldChange,
  serverErrors,
}: {
  form: FormState;
  onFieldChange: (field: StringField, value: string) => void;
  serverErrors: Record<string, string[]> | null;
}) {
  const links: { field: StringField; label: string; placeholder: string }[] = [
    { field: "social_facebook", label: "فيسبوك", placeholder: "https://facebook.com/..." },
    { field: "social_twitter", label: "تويتر / إكس", placeholder: "https://x.com/..." },
    { field: "social_instagram", label: "إنستغرام", placeholder: "https://instagram.com/..." },
    { field: "social_youtube", label: "يوتيوب", placeholder: "https://youtube.com/..." },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">روابط التواصل الاجتماعي</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Field key={link.field}>
            <FieldLabel htmlFor={`settings-${link.field}`}>{link.label}</FieldLabel>
            <FieldContent>
              <Input
                id={`settings-${link.field}`}
                type="url"
                dir="ltr"
                placeholder={link.placeholder}
                value={form[link.field]}
                onChange={(e) => onFieldChange(link.field, e.target.value)}
                className="h-9 text-left"
              />
              <FieldError
                errors={[{ message: serverErrors?.[link.field]?.[0] }]}
              />
            </FieldContent>
          </Field>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  const { data, isLoading } = usePlatformSettings();
  const settings = data?.data;

  if (isLoading || !settings) {
    return (
      <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="إعدادات المنصة" description="الاسم والشعار والرسائل العامة." />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }

  return <SettingsForm settings={settings} />;
}

function SettingsForm({ settings }: { settings: PlatformSettings }) {
  const updateSettings = useUpdatePlatformSettings();

  const [form, setForm] = useState<FormState>(() => toForm(settings));
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  function handleFieldChange(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerErrors((prev) => {
      if (!prev || prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErrors(null);

    if (!form.site_name.trim()) {
      showApiError({ message: "يرجى إدخال اسم المنصة." });
      setServerErrors({ site_name: ["يرجى إدخال اسم المنصة."] });
      return;
    }

    updateSettings.mutate(
      {
        site_name: form.site_name.trim(),
        site_logo: form.site_logo.trim() || null,
        welcome_message: form.welcome_message.trim() || null,
        maintenance_mode: form.maintenance_mode,
        social_facebook: form.social_facebook.trim() || null,
        social_twitter: form.social_twitter.trim() || null,
        social_instagram: form.social_instagram.trim() || null,
        social_youtube: form.social_youtube.trim() || null,
      },
      {
        onError: (error) =>
          setServerErrors(
            (error as { errors?: Record<string, string[]> })?.errors ?? null
          ),
      }
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="إعدادات المنصة"
        description="الاسم والشعار ورسالة الترحيب وروابط التواصل."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">الهوية والرسائل</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="settings-site-name">اسم المنصة *</FieldLabel>
              <FieldContent>
                <Input
                  id="settings-site-name"
                  value={form.site_name}
                  onChange={(e) => handleFieldChange("site_name", e.target.value)}
                  className="h-9"
                />
                <FieldError errors={[{ message: serverErrors?.site_name?.[0] }]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="settings-site-logo">رابط الشعار</FieldLabel>
              <FieldContent>
                <Input
                  id="settings-site-logo"
                  type="url"
                  dir="ltr"
                  placeholder="https://..."
                  value={form.site_logo}
                  onChange={(e) => handleFieldChange("site_logo", e.target.value)}
                  className="h-9 text-left"
                />
                <FieldError errors={[{ message: serverErrors?.site_logo?.[0] }]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="settings-welcome">رسالة الترحيب</FieldLabel>
              <FieldContent>
                <Textarea
                  id="settings-welcome"
                  rows={4}
                  placeholder="أهلاً بكم في مدرستي..."
                  value={form.welcome_message}
                  onChange={(e) => handleFieldChange("welcome_message", e.target.value)}
                />
                <FieldError
                  errors={[{ message: serverErrors?.welcome_message?.[0] }]}
                />
              </FieldContent>
            </Field>

            <Field>
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={form.maintenance_mode}
                  onCheckedChange={(checked) =>
                    handleFieldChange("maintenance_mode", checked === true)
                  }
                />
                تفعيل وضع الصيانة (إخفاء المنصة عن الزوار)
              </label>
              <FieldError
                errors={[{ message: serverErrors?.maintenance_mode?.[0] }]}
              />
            </Field>
          </CardContent>
        </Card>

        <SocialLinksCard
          form={form}
          onFieldChange={handleFieldChange}
          serverErrors={serverErrors}
        />

        {serverErrors && Object.keys(serverErrors).length > 0 && (
          <FieldError
            errors={Object.values(serverErrors).map((msg) => ({ message: msg?.[0] }))}
          />
        )}

        <div>
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? <Spinner /> : <Save />}
            {updateSettings.isPending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </form>
    </div>
  );
}