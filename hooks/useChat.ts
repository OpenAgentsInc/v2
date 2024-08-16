import { useState, useCallback, useEffect, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { Message, Thread } from '@/types'
import { useChatStore } from '../store/chat'
import { Id } from '../convex/_generated/dataModel'
import { createNewMessage, updateMessageId } from '@/panes/chat/chatUtils'
import { useChat as useVercelChat, Message as VercelMessage } from 'ai/react'
import { useDebounce } from 'use-debounce'
import { useBalanceStore } from '@/store/balance'
import { useModelStore } from '@/store/models'
import { useRepoStore } from '@/store/repo'
import { useToolStore } from '@/store/tools'

/**
 * Custom hook for managing chat functionality.
 * @param propsId - The ID of the current chat thread passed as a prop.
 * @returns An object containing messages, sendMessage function, and other chat-related properties.
 */
export function useChat({ propsId }: { propsId?: Id<"threads"> }) {
  const { user } = useUser()
  const [threadId, setThreadId] = useState<Id<"threads"> | null>(propsId || null)
  const [threadData, setThreadData] = useState<Thread>({ messages: [] })
  const [error, setError] = useState<string | null>(null)
  const currentModelRef = useRef<string | null>(null)

  const { threads, addMessageToThread, setThread, setCurrentThreadId } = useChatStore()
  const sendMessageMutation = useMutation(api.messages.saveChatMessage)
  const fetchMessages = useQuery(api.messages.fetchThreadMessages, threadId ? { thread_id: threadId } : "skip")
  const createNewThread = useMutation(api.threads.createNewThread)
  const generateTitle = useMutation(api.threads.generateTitle)

  const model = useModelStore((state) => state.model)
  const repo = useRepoStore((state) => state.repo)
  const tools = useToolStore((state) => state.tools)
  const setBalance = useBalanceStore((state) => state.setBalance)

  const vercelChatProps = useVercelChat({
    id: threadId?.toString(),
    initialMessages: threadData.messages as VercelMessage[],
    body: { model: model.id, tools, threadId, repoOwner: repo?.owner, repoName: repo?.name, repoBranch: repo?.branch },
    maxToolRoundtrips: 20,
    onFinish: async (message, options) => {
      if (threadId && user) {
        const updatedMessages = [...threadData.messages, message as Message]
        setThreadData({ ...threadData, messages: updatedMessages })

        try {
          const result = await sendMessageMutation({
            thread_id: threadId,
            clerk_user_id: user.id,
            content: message.content,
            role: message.role,
            model_id: currentModelRef.current || model.id, // Use model_id instead of model
          })

          if (result && result.newBalance) {
            setBalance(result.newBalance)
          }
          setError(null)

          if (updatedMessages.length === 1 && updatedMessages[0].role === 'assistant') {
            try {
              const title = await generateTitle({ threadId })
              setThreadData({ ...threadData, title })
            } catch (error) {
              console.error('Error generating title:', error)
            }
          }
        } catch (error: any) {
          console.error('Error saving chat message:', error)
          setError(error.message || 'An error occurred while saving the message')
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error)
      setError(error.message || 'An error occurred during the chat')
    },
  })

  const [debouncedMessages] = useDebounce(vercelChatProps.messages, 250, { maxWait: 250 })

  useEffect(() => {
    if (propsId) {
      setThreadId(propsId)
      setCurrentThreadId(propsId)
    } else if (!threadId && user) {
      createNewThread({
        clerk_user_id: user.id,
        metadata: {},
      })
        .then((newThreadId) => {
          if (newThreadId && typeof newThreadId === 'string') {
            setThreadId(newThreadId as Id<"threads">)
            setCurrentThreadId(newThreadId as Id<"threads">)
          } else {
            console.error('Unexpected thread response:', newThreadId)
          }
        })
        .catch(error => {
          console.error('Error creating new thread:', error)
          toast.error('Failed to create a new chat thread. Please try again.')
        })
    }
  }, [propsId, threadId, setCurrentThreadId, user, createNewThread])

  useEffect(() => {
    if (threadId && fetchMessages) {
      const thread: Thread = {
        id: threadId,
        title: threadData.title || 'New Chat',
        messages: fetchMessages as Message[],
        createdAt: threadData.createdAt || new Date(),
      }
      setThreadData(thread)
      setThread(threadId, thread)
    }
  }, [threadId, fetchMessages, setThread])

  const sendMessage = useCallback(async (content: string) => {
    if (!threadId || !user) {
      console.error('No thread ID or user available')
      return
    }

    const newMessage = createNewMessage(threadId, user.id, content)
    addMessageToThread(threadId, newMessage)

    try {
      vercelChatProps.append(newMessage as VercelMessage)
      await sendMessageMutation({
        thread_id: threadId,
        clerk_user_id: user.id,
        content,
        role: 'user',
        model_id: model.id, // Use model_id instead of model
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
      // Remove the message from the thread if it failed to send
      setThreadData({ ...threadData, messages: threadData.messages.filter(m => m.id !== newMessage.id) })
    }
  }, [threadId, user, vercelChatProps, threadData, addMessageToThread, sendMessageMutation, model])

  return {
    ...vercelChatProps,
    messages: debouncedMessages,
    id: threadId,
    threadData,
    user,
    setCurrentThreadId,
    sendMessage,
    error,
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