"use client";

import { cn } from "@/lib/utils";
import type { LabReadout } from "../engine/types";

const CHANNELS = [
  { key: "ep", label: "الوضع (Ep)", bar: "from-blue-600 to-cyan-300", text: "text-cyan-300" },
  { key: "ek", label: "الحركية (Ek)", bar: "from-emerald-600 to-emerald-300", text: "text-emerald-300" },
  { key: "et", label: "الكلية (Et)", bar: "from-violet-600 to-violet-300", text: "text-violet-300" },
] as const;

/**
 * أعمدة الطاقة بمقياس واحد (ref) — لذلك Ep + Ek = Et مقروءة بصرياً،
 * والقيم محسوبة من حالة المحاكاة لا من منحنى مرسوم.
 */
export function EnergyMeters({ readout }: { readout: LabReadout | null }) {
  const values = {
    ep: readout?.ep ?? 0,
    ek: readout?.ek ?? 0,
    et: readout?.et ?? 0,
  };
  const scale = Math.max(readout?.ref ?? 1, 0.001);

  return (
    <div className="flex items-stretch gap-2">
      {CHANNELS.map((channel) => {
        const ratio = Math.min(1, Math.max(0, values[channel.key] / scale));

        return (
          <div key={channel.key} className="flex flex-1 flex-col items-center gap-1">
            <span
              dir="ltr"
              className={cn("font-mono text-[11px] font-bold tabular-nums", channel.text)}
            >
              {values[channel.key].toFixed(1)} J
            </span>
            <div className="flex h-16 w-full items-end justify-center overflow-hidden rounded-lg bg-white/5 p-1">
              <div
                className={cn(
                  "w-10 rounded-md bg-gradient-to-t transition-[height] duration-75",
                  channel.bar,
                )}
                style={{ height: `${ratio * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{channel.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function LabChips({ readout }: { readout: LabReadout | null }) {
  if (!readout || readout.info.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {readout.info.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-baseline gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-400"
        >
          <b dir="ltr" className="font-mono text-[11px] text-slate-100 tabular-nums">{item.value}</b>
          {item.label}
        </span>
      ))}
    </div>
  );
}
