import { useQuery } from "convex/react"
import { useCallback, useState, useMemo } from "react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { sendMessage as libSendMessage } from "@/lib/chat/sendMessage"
import { useModelStore } from "@/store/models"
import { useRepoStore } from "@/store/repo"

interface UseChatProps {
  threadId: string
}

export function useChat({ threadId }: UseChatProps) {
  const [isLoading, setIsLoading] = useState(false)
  const model = useModelStore(s => s.model)
  const repo = useRepoStore(s => s.repo)
  
  const messages = useQuery(
    api.messages.fetchThreadMessages.fetchThreadMessages, 
    { thread_id: threadId as Id<"threads"> },
    { initialData: [] }
  );

  const sendMessage = useCallback(async (text: string) => {
    setIsLoading(true)
    const res = await libSendMessage({ modelId: model.id, repo, text, threadId })
    console.log("libSendMessage response", res)
    setIsLoading(false)
  }, [threadId, model.id, repo])

  const allMessages = useMemo(() => {
    if (!messages) return []
    
    return messages.map(message => ({
      ...message,
      content: message.content || '',
    }))
  }, [messages])

  return {
    isLoading,
    messages: allMessages,
    sendMessage
  }
}