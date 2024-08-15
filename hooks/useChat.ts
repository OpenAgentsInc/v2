import { useState, useCallback, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { Message } from '@/types'
import { useChatStore } from './useChatStore'
import { Id } from '../convex/_generated/dataModel'

export function useChat(threadId: Id<"threads"> | null) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const { messages, addMessage, updateMessage } = useChatStore()
  const sendMessage = useMutation(api.messages.sendMessage)

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !threadId) return

    setIsLoading(true)

    const tempId = Date.now().toString()
    const newMessage: Message = {
      _id: tempId,
      thread_id: threadId,
      clerk_user_id: user.id,
      role: 'user',
      content,
      _creationTime: Date.now(),
    }

    addMessage(threadId, newMessage)

    try {
      const result = await sendMessage({
        thread_id: threadId,
        clerk_user_id: user.id,
        content,
      })

      if (result) {
        updateMessage(threadId, tempId, {
          ...newMessage,
          _id: result._id,
          _creationTime: result._creationTime,
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [user, threadId, addMessage, sendMessage, updateMessage])

  return {
    messages: messages[threadId || ''] || [],
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

      if (newThread && newThread._id) {
        setCurrentThreadId(newThread._id)
        return newThread._id
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
  const listThreads = useMutation(api.threads.listThreads)
  const [threads, setThreads] = useState<Array<{
    id: Id<"threads">,
    title: string,
    lastMessagePreview: string,
    createdAt: string,
  }>>([])

  useEffect(() => {
    const fetchThreads = async () => {
      if (!user) return

      try {
        const threadList = await listThreads({ clerk_user_id: user.id })
        setThreads(threadList)
      } catch (error) {
        console.error('Error fetching threads:', error)
        toast.error('Failed to fetch chat threads. Please try again.')
      }
    }

    fetchThreads()
  }, [user, listThreads])

  return threads
}