import { CompletionUsage } from "ai"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface SaveAssistantMessageProps {
  content: string
  finishReason?: string
  modelId: string
  threadId: string
  toolCalls?: any
  toolResults?: any
  usage: CompletionUsage
  userId: string
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function saveAssistantMessage({ content, finishReason, modelId, usage, threadId, toolCalls, toolResults, userId }: SaveAssistantMessageProps) {
  return await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
    clerk_user_id: userId,
    completion_tokens: usage.completion_tokens,
    content,
    finish_reason: finishReason,
    model_id: modelId,
    prompt_tokens: usage.completion_tokens,
    role: 'assistant',
    tool_calls: toolCalls,
    tool_results: toolResults,
    thread_id: threadId as Id<"threads">,
  });
}
