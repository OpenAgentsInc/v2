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
  usage?: CompletionUsage
  userId: string
  isPartial: boolean
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

let debounceTimer: NodeJS.Timeout | null = null;
let messageId: Id<"messages"> | null = null;

export async function createOrUpdateAssistantMessage({
  content,
  finishReason,
  modelId,
  usage,
  threadId,
  toolCalls,
  toolResults,
  userId,
  isPartial
}: SaveAssistantMessageProps) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    const messageData = {
      clerk_user_id: userId,
      completion_tokens: usage?.completion_tokens,
      content,
      finish_reason: finishReason,
      model_id: modelId,
      prompt_tokens: usage?.prompt_tokens,
      role: 'assistant',
      tool_calls: toolCalls,
      tool_results: toolResults,
      thread_id: threadId as Id<"threads">,
      status: isPartial ? 'partial' : 'complete',
    };

    if (messageId) {
      await convex.mutation(api.messages.updateChatMessage.updateChatMessage, {
        id: messageId,
        ...messageData,
      });
    } else {
      const result = await convex.mutation(api.messages.saveChatMessage.saveChatMessage, messageData);
      messageId = result._id as Id<"messages">;
    }
  }, 500); // Debounce for 500ms (0.5 seconds)

  // If it's the final message, wait for the debounce to complete
  if (!isPartial) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export async function saveAssistantMessage({
  content,
  finishReason,
  modelId,
  usage,
  threadId,
  toolCalls,
  toolResults,
  userId
}: Omit<SaveAssistantMessageProps, 'isPartial'>) {
  return await createOrUpdateAssistantMessage({
    content,
    finishReason,
    modelId,
    usage,
    threadId,
    toolCalls,
    toolResults,
    userId,
    isPartial: false
  });
}