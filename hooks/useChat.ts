import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { Message } from '@/types'
import { useChatStore } from '../store/chat'
import { Id } from '../convex/_generated/dataModel'

export function useChat(threadId: Id<"threads"> | null) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const { threads, addMessageToThread, setThread } = useChatStore()
  const sendMessageMutation = useMutation(api.messages.saveChatMessage)
  const fetchMessages = useQuery(api.messages.fetchThreadMessages, threadId ? { thread_id: threadId } : "skip")

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !threadId) return

    setIsLoading(true)

    const tempId = Date.now().toString()
    const newMessage: Message = {
      _id: tempId as Id<"messages">,
      thread_id: threadId,
      clerk_user_id: user.id,
      role: 'user',
      content,
      _creationTime: Date.now(),
    }

    addMessageToThread(threadId, newMessage)

    try {
      const result = await sendMessageMutation({
        thread_id: threadId,
        clerk_user_id: user.id,
        content,
        role: 'user',
      })

      if (result) {
        const updatedMessage = { ...newMessage, _id: result }
        addMessageToThread(threadId, updatedMessage)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [user, threadId, addMessageToThread, sendMessageMutation])

  useEffect(() => {
    if (fetchMessages && threadId) {
      setThread(threadId, {
        id: threadId,
        title: 'New Chat', // You might want to update this with the actual title
        messages: fetchMessages,
        createdAt: new Date(),
      })
    }
  }, [fetchMessages, setThread, threadId])

  return {
    messages: threads[threadId || '']?.messages || [],
    sendMessage: handleSendMessage,
    isLoading,
  }
}

export function useChatActions() {
  const { user } = useUser()
  const createNewThread = useMutation(api.threads.createNewThread)
  const { setCurrentThreadId } = useChatStore()

  const handleCreateNewThread = useCallback(async () => {
    if (!user) return null

    try {
      const newThread = await createNewThread({
        clerk_user_id: user.id,
        metadata: {},
      })

      if (newThread) {
        setCurrentThreadId(newThread as Id<"threads">)
        return newThread
      } else {
        console.error('Unexpected thread response:', newThread)
        return null
      }
    } catch (error) {
      console.error('Error creating new thread:', error)
      toast.error('Failed to create a new chat thread. Please try again.')
      return null
    }
  }, [user, createNewThread, setCurrentThreadId])

  return {
    createNewThread: handleCreateNewThread,
  }
}

export function useThreadList() {
  const { user } = useUser()
  const listThreads = useQuery(api.threads.listThreads, user ? { clerk_user_id: user.id } : "skip")
  const [threads, setThreads] = useState<Array<{
    id: Id<"threads">,
    title: string,
    lastMessagePreview: string,
    createdAt: string,
  }>>([])

  useEffect(() => {
    if (listThreads) {
      setThreads(listThreads)
    }
  }, [listThreads])

  return threads
}