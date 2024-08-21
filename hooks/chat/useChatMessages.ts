import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Message } from "@/types";

export function useChatMessages(threadId: Id<"threads"> | null) {
  return useQuery(api.messages.fetchThreadMessages.fetchThreadMessages, threadId ? { thread_id: threadId } : "skip");
}

export function useProcessedMessages(messages: Message[]) {
  return messages.map((message) => ({
    ...message,
    content: message.content.trim() === '' && (!message.toolInvocations || Object.keys(message.toolInvocations).length === 0)
      ? "--"
      : message.content
  }));
}