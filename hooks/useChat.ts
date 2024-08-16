import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { Message } from '@/types'
import { useChatStore } from '../store/chat'
import { Id } from '../convex/_generated/dataModel'
import { createNewMessage, updateMessageId, Thread } from '@/panes/chat/chatUtils'

/**
 * Custom hook for managing chat functionality.
 * @param threadId - The ID of the current chat thread.
 * @returns An object containing messages, sendMessage function, and loading state.
 */
export function useChat(threadId: Id<"threads"> | null) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const { threads, addMessageToThread, setThread } = useChatStore()
  const sendMessageMutation = useMutation(api.messages.saveChatMessage)
  const fetchMessages = useQuery(api.messages.fetchThreadMessages, threadId ? { thread_id: threadId } : "skip")

  /**
   * Sends a new message in the current thread.
   * @param content - The content of the message to send.
   */
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !threadId) return

    setIsLoading(true)

    const newMessage = createNewMessage(threadId, user.id, content)
    addMessageToThread(threadId, newMessage)

    try {
      const result = await sendMessageMutation({
        thread_id: threadId,
        clerk_user_id: user.id,
        content,
        role: 'user',
      })

      if (result) {
        const updatedMessage = updateMessageId(newMessage, result._id)
        addMessageToThread(threadId, updatedMessage)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [user, threadId, addMessageToThread, sendMessageMutation])

  // Update the thread in the store when messages are fetched
  useEffect(() => {
    if (fetchMessages && threadId) {
      const thread: Thread = {
        id: threadId,
        title: 'New Chat', // You might want to update this with the actual title
        messages: fetchMessages as Message[],
        createdAt: new Date(),
      }
      setThread(threadId, thread)
    }
  }, [fetchMessages, setThread, threadId])

  return {
    messages: threads[threadId || '']?.messages || [],
    sendMessage: handleSendMessage,
    isLoading,
  }
}

/**
 * Custom hook for chat-related actions.
 * @returns An object containing the createNewThread function.
 */
export function useChatActions() {
  const { user } = useUser()
  const createNewThread = useMutation(api.threads.createNewThread)
  const { setCurrentThreadId } = useChatStore()

  /**
   * Creates a new chat thread.
   * @returns The ID of the newly created thread, or null if creation failed.
   */
  const handleCreateNewThread = useCallback(async () => {
    if (!user) return null

    try {
      const newThread = await createNewThread({
        clerk_user_id: user.id,
        metadata: {},
      })

      if (newThread && typeof newThread === 'string') {
        const threadId = newThread as Id<"threads">
        setCurrentThreadId(threadId)
        return threadId
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

interface ThreadMetadata {
  title?: string;
  lastMessagePreview?: string;
}

/**
 * Custom hook for retrieving the list of chat threads.
 * @returns An array of thread objects.
 */
export function useThreadList() {
  const { user } = useUser()
  const getUserThreads = useQuery(api.threads.getUserThreads, user ? { clerk_user_id: user.id } : "skip")
  const [threads, setThreads] = useState<Array<{
    id: Id<"threads">,
    title: string,
    lastMessagePreview: string,
    createdAt: string,
  }>>([])

  useEffect(() => {
    if (getUserThreads) {
      setThreads(getUserThreads.map(thread => ({
        id: thread._id,
        title: (thread.metadata as ThreadMetadata)?.title || 'New Chat',
        lastMessagePreview: (thread.metadata as ThreadMetadata)?.lastMessagePreview || '',
        createdAt: thread.createdAt,
      })))
    }
  }, [getUserThreads])

  return threads
}