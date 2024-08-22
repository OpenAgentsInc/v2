import { useQuery, useSubscription } from "convex/react"
import { useCallback, useState, useEffect } from "react"
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
  const [streamingMessage, setStreamingMessage] = useState("")
  const model = useModelStore(s => s.model)
  const repo = useRepoStore(s => s.repo)
  const messages = useQuery(api.messages.fetchThreadMessages.fetchThreadMessages, { thread_id: threadId as Id<"threads"> });

  // Subscribe to message updates
  const latestMessage = useSubscription(api.messages.subscribeToLatestMessage.subscribeToLatestMessage, { thread_id: threadId as Id<"threads"> });

  useEffect(() => {
    if (latestMessage && latestMessage.status === 'partial') {
      setStreamingMessage(latestMessage.content)
    } else if (latestMessage && latestMessage.status === 'complete') {
      setStreamingMessage("")
    }
  }, [latestMessage])

  const sendMessage = useCallback(async (text: string) => {
    setIsLoading(true)
    setStreamingMessage("")
    const res = await libSendMessage({ modelId: model.id, repo, text, threadId })
    console.log("libSendMessage response", res)
    setIsLoading(false)
  }, [threadId, setIsLoading, model.id, repo])

  // Combine fetched messages with the streaming message
  const allMessages = [
    ...(messages || []),
    ...(streamingMessage ? [{ content: streamingMessage, role: 'assistant', status: 'partial' }] : [])
  ]

  return {
    isLoading,
    messages: allMessages,
    sendMessage
  }
}