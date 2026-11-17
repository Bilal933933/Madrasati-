"use client";

import { Braces, Layers, MousePointerClick } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SandboxDoc } from "../mock/paragraph";
import { SCENES } from "../scene/scenes";
import { ScenePanel } from "../scene/scene-panel";
import { SandboxRichContent } from "./sandbox-rich-content";

/**
 * عرض تجريبي: نفس المشهد بمرأى مستقل، ثم داخل فقرة درس.
 * الفرق بين الحالتين هو غلاف فقط — العقدة والبيانات واحدة.
 */

const DEMO_DOCS: Record<string, SandboxDoc> = {
  "solar-system": {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "الكواكب لا تقف مكانها: كل كوكب يدور حول الشمس بمدار مختلف، ويختلف طول مداره بحسب بعده عنها.",
          },
        ],
      },
      {
        type: "interactive_lab",
        attrs: {
          labKind: "scene",
          sceneId: "solar-system",
          caption: "اسحب للتدوير وقرّب بعجلة الفأرة، ثم انقر الشمس أو الكوكب لقراءة بطاقته.",
        },
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "الأرض تُكمل دورتها في سنة واحدة، أما المريخ فيحتاج نحو " },
          { type: "text", text: "687 يوماً", marks: ["bold"] },
          { type: "text", text: "، ولهذا يبدو أبطأ في المشهد." },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "البعد الأكبر عن الشمس يعني مداراً أطول، لا سرعة أكبر." },
            ],
          },
        ],
      },
    ],
  },
  "water-molecule": {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "جزيء الماء يتكوّن من ذرة أكسجين واحدة وذرتي هيدروجين، ترتبط الذرات بروابط تساهمية قطبية.",
          },
        ],
      },
      {
        type: "interactive_lab",
        attrs: {
          labKind: "scene",
          sceneId: "water-molecule",
          caption: "انقر أي ذرة لعرض بطاقتها، ولاحظ أن الذرتين لا تقعان على استقامة واحدة.",
        },
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "زاوية الرابطة في الماء نحو " },
          { type: "text", text: "104.5°", marks: ["bold"] },
          { type: "text", text: "، وهذا ما يجعل الجزيء قطبيّاً وقادراً على إذابة كثير من الأملاح." },
        ],
      },
    ],
  },
};

type DemoView = "panel" | "paragraph";

export function SceneLabDemo({ initialSceneId }: { initialSceneId: string }) {
  const [sceneId, setSceneId] = useState(initialSceneId);
  const [view, setView] = useState<DemoView>("panel");
  const entry = SCENES.find((scene) => scene.id === sceneId) ?? SCENES[0];
  const doc = DEMO_DOCS[entry.id];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-5">
        <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground">
          <Layers className="size-3.5 text-amber-500" aria-hidden />
          بيئة معزولة · مشهد من بيانات JSON
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold">عارض مشاهد عام</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          المشهد كله بيانات: بدائيات هندسية، ألوان، حركة، وتسميات وبطاقات. لا سكربت لكل درس،
          ولا سطر كود جديد لإضافة مشهد. التحقق يرفض أي مفتاح غير معروف أو قيمة خارج المدى.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => setSceneId(scene.id)}
              aria-pressed={scene.id === entry.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
                scene.id === entry.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {scene.title}
              <span className="ms-1.5 text-[10px] font-semibold opacity-70">{scene.subject}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <ViewTab active={view === "panel"} onClick={() => setView("panel")} label="المشهد" />
          <ViewTab
            active={view === "paragraph"}
            onClick={() => setView("paragraph")}
            label="داخل فقرة الدرس"
          />
        </div>
      </div>

      {view === "panel" ? (
        <ScenePanel key={entry.id} manifest={entry.manifest} size="stage" />
      ) : (
        <div className="rounded-2xl border border-border bg-card px-4 py-5">
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
            <MousePointerClick className="size-3.5 text-amber-500" aria-hidden />
            نفس العقدة، داخل نص الفقرة: النص بعرض 42rem والمشهد يخرج للعرض الكامل
          </p>
          {doc ? <SandboxRichContent doc={doc} labSize="stage" /> : null}
        </div>
      )}

      <details className="mt-4 rounded-2xl border border-border bg-card p-3">
        <summary className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
          <Braces className="size-3.5 text-sky-500" aria-hidden />
          بيانات المشهد (JSON v1) — هذا كل ما يحتاجه الدرس
        </summary>
        <pre
          dir="ltr"
          className="mt-3 max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-[10px] leading-relaxed text-slate-300"
        >
          {JSON.stringify(entry.manifest, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
