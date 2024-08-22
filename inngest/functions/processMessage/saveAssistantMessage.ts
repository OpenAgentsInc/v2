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
  console.log('createOrUpdateAssistantMessage called with:', { content, finishReason, modelId, usage, threadId, toolCalls, toolResults, userId, isPartial });

  if (debounceTimer) {
    console.log('Clearing existing debounce timer');
    clearTimeout(debounceTimer);
  }

  return new Promise<void>((resolve) => {
    console.log('Setting up new debounce timer');
    debounceTimer = setTimeout(async () => {
      console.log('Debounce timer fired, preparing messageData');
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
      console.log('messageData prepared:', messageData);

      try {
        if (messageId) {
          console.log('Updating existing message with ID:', messageId);
          await convex.mutation(api.messages.updateChatMessage.updateChatMessage, {
            id: messageId,
            ...messageData,
          });
          console.log('Message updated successfully');
        } else {
          console.log('Creating new message');
          const result = await convex.mutation(api.messages.saveChatMessage.saveChatMessage, messageData);
          console.log('New message created, result:', result);
          if (result && result._id) {
            messageId = result._id as Id<"messages">;
            console.log('New messageId set:', messageId);
          } else {
            console.error('Failed to create new message: result or result._id is null');
          }
        }
      } catch (error) {
        console.error('Error in createOrUpdateAssistantMessage:', error);
      }

      resolve();
    }, 500); // Debounce for 500ms (0.5 seconds)
  });
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
  console.log('saveAssistantMessage called with:', { content, finishReason, modelId, usage, threadId, toolCalls, toolResults, userId });
  
  await createOrUpdateAssistantMessage({
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

  console.log('saveAssistantMessage completed');
}