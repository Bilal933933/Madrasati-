import type * as THREE from "three";

/** يحرّر ذاكرة GPU لأي مجسم داخل مجموعة */
export function disposeGroup(group: THREE.Group): void {
  group.traverse((node) => {
    const mesh = node as THREE.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) material.forEach((item) => item.dispose());
    else material?.dispose();
  });
}
