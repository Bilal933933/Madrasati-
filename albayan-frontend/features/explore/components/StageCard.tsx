import { Layers } from "lucide-react";
import Link from "next/link";
import { ExploreThumb } from "./ExploreThumb";
import { EXPLORE_ICONS } from "../lib/exploreIcons";
import type { ExploreStage } from "../types/explore.types";

/**
 * بطاقة مرحلة دراسية — تربط الزائر بصفحة الصفوف.
 */
export function StageCard({ stage }: { stage: ExploreStage }) {
  const Icon = EXPLORE_ICONS[stage.icon ?? ""] ?? Layers;

  return (
    <Link
      href={`/explore/${stage.key}`}
      className="group flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <ExploreThumb
        image={stage.image}
        className="size-14 rounded-xl"
        alt={stage.name}
        fallback={
          <span
            className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl"
            style={{ backgroundColor: stage.color ?? undefined, color: "#fff" }}
          >
            <Icon className="size-6" />
          </span>
        }
      />

      <div>
        <h2 className="text-lg font-bold">{stage.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{stage.grades_count} صفوف دراسية</p>
      </div>
    </Link>
  );
}
