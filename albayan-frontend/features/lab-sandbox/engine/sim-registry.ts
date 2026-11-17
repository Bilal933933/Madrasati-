import { createPendulum } from "./physics/pendulum";
import { createRamp } from "./physics/ramp";
import { createSpring } from "./physics/spring";
import type { LabControlSpec, LabKind, LabSceneBridge, LabSim } from "./types";

/** ينشئ محاكاة حسب نوع المختبر — نقطة التوسّع الوحيدة عند إضافة مختبر جديد */
export function createSim(
  kind: LabKind,
  bridge: LabSceneBridge,
  controls: LabControlSpec[],
): LabSim {
  switch (kind) {
    case "pendulum":
      return createPendulum(bridge, controls);
    case "ramp":
      return createRamp(bridge, controls);
    case "spring":
      return createSpring(bridge, controls);
  }
}
