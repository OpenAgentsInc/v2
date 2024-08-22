import { CompletionUsage } from "ai"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface SaveAssistantMessageProps {
  content: string
  modelId: string
  threadId: string
  usage: CompletionUsage
  userId: string
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function saveAssistantMessage({ content, modelId, usage, threadId, userId }: SaveAssistantMessageProps) {
  return await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
    clerk_user_id: userId,
    completion_tokens: usage.completion_tokens,
    content,
    model_id: modelId,
    prompt_tokens: usage.completion_tokens,
    role: 'assistant',
    thread_id: threadId as Id<"threads">,
  });
}
