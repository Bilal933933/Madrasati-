"use client";

import type { LabControlSpec } from "../engine/types";

interface LabControlsProps {
  controls: LabControlSpec[];
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
}

/** منزلقات مبنية من مخطط المختبر — إضافة منزلق = سطر في البيانات فقط */
export function LabControls({ controls, values, onChange }: LabControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      {controls.map((control) => {
        const value = values[control.id] ?? control.value;

        return (
          <div key={control.id}>
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-semibold">
              <label htmlFor={`lab-control-${control.id}`} className="text-slate-300">
                {control.label}
              </label>
              <output dir="ltr" className="font-mono tabular-nums" style={{ color: control.color }}>
                {control.format(value)}
              </output>
            </div>
            <input
              id={`lab-control-${control.id}`}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={value}
              onChange={(event) => onChange(control.id, Number(event.target.value))}
              style={{ accentColor: control.color }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15"
            />
          </div>
        );
      })}
    </div>
  );
}
