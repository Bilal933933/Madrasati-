import { AiTutorWorkspace } from "@/features/ai-tutor/components/ai-tutor-workspace";

export default async function AiTutorThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <AiTutorWorkspace threadId={threadId} />;
}
