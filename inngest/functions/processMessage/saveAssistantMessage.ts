import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface SaveAssistantMessageProps {
  content: string
  modelId: string
  threadId: string
  userId: string
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function saveAssistantMessage({ content, modelId, threadId, userId }: SaveAssistantMessageProps) {
  return await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
    clerk_user_id: userId,
    thread_id: threadId as Id<"threads">,
    content,
    role: 'assistant',
    model_id: modelId
  });
}
