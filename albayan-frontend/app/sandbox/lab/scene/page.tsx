import { SceneLabDemo } from "@/features/lab-sandbox/components/scene-lab-demo";
import { SCENES } from "@/features/lab-sandbox/scene/scenes";

/** عارض مشاهد عام — ملف إضافي بحت داخل app/sandbox */
export default async function SceneLabRoute({
  searchParams,
}: {
  searchParams: Promise<{ scene?: string }>;
}) {
  const query = await searchParams;
  const initialSceneId = SCENES.some((scene) => scene.id === query.scene)
    ? (query.scene as string)
    : SCENES[0].id;

  return <SceneLabDemo initialSceneId={initialSceneId} />;
}
