import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface UseChatProps {
  threadId: string
}

export function useChat({ threadId }: UseChatProps) {
  const messages = useQuery(api.messages.fetchThreadMessages.fetchThreadMessages, { thread_id: threadId as Id<"threads"> });
  return {
    isLoading: false,
    messages: messages || [],
    sendMessage: () => { }
  }
}
