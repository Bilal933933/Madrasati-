/**
 * مولّد أصل GLB للبيئة المعزولة — يعمل مرة واحدة عند التطوير فقط.
 *
 *   node features/lab-sandbox/tools/make-heart-glb.mjs
 *
 * لماذا كاتب GLB يدوي بدل GLTFExporter؟ المصدّر الرسمي يستخدم FileReader وهو غير
 * موجود في Node، فنكتب الحاوية (JSON chunk + BIN chunk) مباشرة. الناتج glTF 2.0
 * قياسي يقرأه أي عارض، وليس صيغة خاصة بنا.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as THREE from "three";

const OUT = resolve("public/sandbox/models/heart.glb");

/* ---------------------------- بناء الشكل ---------------------------- */

const shape = new THREE.Shape();
shape.moveTo(0, 0.35);
shape.bezierCurveTo(0.35, 0.95, 1.15, 0.9, 1.15, 0.15);
shape.bezierCurveTo(1.15, -0.5, 0.5, -0.85, 0, -1.25);
shape.bezierCurveTo(-0.5, -0.85, -1.15, -0.5, -1.15, 0.15);
shape.bezierCurveTo(-1.15, 0.9, -0.35, 0.95, 0, 0.35);

const geometry = new THREE.ExtrudeGeometry(shape, {
  depth: 0.85,
  bevelEnabled: true,
  bevelThickness: 0.18,
  bevelSize: 0.16,
  bevelSegments: 6,
  curveSegments: 40,
});

/* توسيط حول المحور z ثم تجاه مركز الكتلة ليدور حول نفسه */
geometry.center();
geometry.computeVertexNormals();

const flat = geometry.toNonIndexed();
const position = flat.getAttribute("position");
const normal = flat.getAttribute("normal");

/* ---------------------------- كتابة GLB ---------------------------- */

const positions = new Float32Array(position.array);
const normals = new Float32Array(normal.array);
const count = position.count;

const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (let index = 0; index < count; index += 1) {
  for (let axis = 0; axis < 3; axis += 1) {
    const value = positions[index * 3 + axis];
    if (value < min[axis]) min[axis] = value;
    if (value > max[axis]) max[axis] = value;
  }
}

const positionBytes = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength);
const normalBytes = Buffer.from(normals.buffer, normals.byteOffset, normals.byteLength);
const bin = Buffer.concat([positionBytes, normalBytes]);

const gltf = {
  asset: { version: "2.0", generator: "lab-sandbox tools/make-heart-glb" },
  scene: 0,
  scenes: [{ nodes: [0], name: "Heart" }],
  nodes: [{ mesh: 0, name: "heart" }],
  meshes: [
    {
      name: "heart",
      primitives: [
        {
          attributes: { POSITION: 0, NORMAL: 1 },
          material: 0,
          mode: 4,
        },
      ],
    },
  ],
  materials: [
    {
      name: "myocardium",
      doubleSided: true,
      pbrMetallicRoughness: {
        baseColorFactor: [0.62, 0.07, 0.14, 1],
        metallicFactor: 0.05,
        roughnessFactor: 0.52,
      },
    },
  ],
  accessors: [
    {
      bufferView: 0,
      componentType: 5126,
      count,
      type: "VEC3",
      min,
      max,
    },
    {
      bufferView: 1,
      componentType: 5126,
      count,
      type: "VEC3",
    },
  ],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: positionBytes.length, target: 34962 },
    {
      buffer: 0,
      byteOffset: positionBytes.length,
      byteLength: normalBytes.length,
      target: 34962,
    },
  ],
  buffers: [{ byteLength: bin.length }],
};

const json = Buffer.from(JSON.stringify(gltf), "utf8");
const jsonPad = (4 - (json.length % 4)) % 4;
const jsonChunk = Buffer.concat([json, Buffer.alloc(jsonPad, 0x20)]);
const binPad = (4 - (bin.length % 4)) % 4;
const binChunk = Buffer.concat([bin, Buffer.alloc(binPad, 0)]);

const total = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0); // "glTF"
header.writeUInt32LE(2, 4);
header.writeUInt32LE(total, 8);

const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(jsonChunk.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4); // "JSON"

const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(binChunk.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4); // "BIN"

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]));

console.log(
  `heart.glb: ${count} vertices, ${total} bytes, bounds ${min.map((v) => v.toFixed(2))} .. ${max
    .map((v) => v.toFixed(2))}`,
);
