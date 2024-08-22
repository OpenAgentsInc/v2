import { useQuery } from "convex/react"
import { useCallback, useState } from "react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { sendMessage as libSendMessage } from "@/lib/chat/sendMessage"
import { useModelStore } from "@/store/models"

interface UseChatProps {
  threadId: string
}

export function useChat({ threadId }: UseChatProps) {
  const [isLoading, setIsLoading] = useState(false)
  const model = useModelStore(s => s.model)
  const messages = useQuery(api.messages.fetchThreadMessages.fetchThreadMessages, { thread_id: threadId as Id<"threads"> });

  const sendMessage = useCallback(async (text: string) => {
    setIsLoading(true)
    const res = await libSendMessage({ modelId: model.id, text, threadId })
    console.log("libSendMessage response", res)
    setIsLoading(false)
  }, [threadId, setIsLoading])

  return {
    isLoading,
    messages: messages || [],
    sendMessage
  }
}
