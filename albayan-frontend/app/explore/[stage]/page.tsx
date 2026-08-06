import { StagePage } from "@/features/explore/pages/StagePage";

export default async function StageRoute({
  params,
}: {
  params: Promise<{ stage: string }>;
}) {
  const { stage } = await params;
  return <StagePage stageKey={stage} />;
}