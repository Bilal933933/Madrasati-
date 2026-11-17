"use client";

import { FlaskConical, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LabKind } from "../engine/types";
import { useMockLab } from "../hooks/use-mock-lab";
import { LABS } from "../mock/labs";
import { LAB_VARIANTS, type LabVariant } from "../variants";
import { LabFrame } from "./lab-frame";

export type SandboxTheme = "light" | "dark";

interface LabSandboxPageProps {
  labId: string;
  variant: LabVariant;
  theme: SandboxTheme;
}

/**
 * صفحة بيئة معزولة كاملة: ترويسة + مبدّلات (مختبر/هيكل/ثيم) + المختبر.
 * لا تستورد شيئاً من `lesson-engine` ولا من `lib/` عدا `cn`، ولا تتصل بالباك.
 */
export function LabSandboxPage({ labId, variant, theme }: LabSandboxPageProps) {
  const { lab, isLoading } = useMockLab(labId);
  // تجاوز محلي للثيم: الافتراضي من الرابط، والتبديل لا يعيد تحميل المشهد
  const [themeOverride, setThemeOverride] = useState<SandboxTheme | null>(null);
  const currentTheme = themeOverride ?? theme;

  return (
    <div className={cn("min-h-screen bg-background text-foreground", currentTheme === "dark" && "dark")}>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <header className="mb-5 flex flex-col gap-4 border-b border-border pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <FlaskConical className="size-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-[11px] font-bold tracking-wide text-muted-foreground">
                  بيئة معزولة · مختبر ثلاثي الأبعاد
                </p>
                <h1 className="font-heading text-lg font-bold leading-tight">
                  {lab?.label ?? "مختبر الفيزياء"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/sandbox/lab"
                className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                كل المختبرات
              </Link>
              <button
                type="button"
                onClick={() => setThemeOverride((value) => ((value ?? theme) === "dark" ? "light" : "dark"))}
                title="تبديل الثيم"
                aria-label={currentTheme === "dark" ? "التبديل إلى الثيم الفاتح" : "التبديل إلى الثيم الغامق"}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
              >
                {currentTheme === "dark" ? (
                  <Sun className="size-4" aria-hidden />
                ) : (
                  <Moon className="size-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented label="المختبر">
              {LABS.map((item) => (
                <SegmentedLink
                  key={item.id}
                  href={href(item.id, variant)}
                  active={item.id === labId}
                  label={item.label}
                />
              ))}
            </Segmented>

            <Segmented label="الهيكل">
              {LAB_VARIANTS.map((option) => (
                <SegmentedLink
                  key={option.id}
                  href={href(labId, option.id)}
                  active={option.id === variant}
                  label={option.label}
                  hint={option.hint}
                />
              ))}
            </Segmented>
          </div>
        </header>

        <main>
          {isLoading ? (
            <SandboxSkeleton />
          ) : lab ? (
            <LabFrame key={`${lab.id}-${variant}`} lab={lab} variant={variant} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm font-semibold">لا يوجد مختبر بهذا المعرّف</p>
              <p className="mt-1 text-xs text-muted-foreground">
                المعرّف المطلوب: <span className="font-mono">{labId}</span>
              </p>
              <Link
                href="/sandbox/lab"
                className="mt-4 inline-block rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
              >
                عرض كل المختبرات
              </Link>
            </div>
          )}
        </main>

        <footer className="mt-6 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
          نسخة تجريبية معزولة: بيانات ثابتة داخل المستودع، بلا اتصال بالخادم وبلا تخزين محلي.
          حذف المجلدين <code className="font-mono">app/sandbox</code> و{" "}
          <code className="font-mono">features/lab-sandbox</code> يعيد المشروع كما كان.
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------ روابط ومجمّعات ------------------------------ */

function href(labId: LabKind | string, variant: LabVariant): string {
  return `/sandbox/lab/${labId}?variant=${variant}`;
}

function Segmented({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-[11px] font-bold text-muted-foreground">{label}</span>
      <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1">
        {children}
      </div>
    </div>
  );
}

function SegmentedLink({
  href: link,
  active,
  label,
  hint,
}: {
  href: string;
  active: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <Link
      href={link}
      scroll={false}
      aria-current={active ? "page" : undefined}
      title={hint}
      className={cn(
        "rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function SandboxSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      {[0, 1].map((pane) => (
        <div key={pane} className="h-[24rem] animate-pulse rounded-2xl border border-border bg-muted/50" />
      ))}
    </div>
  );
}
