import { Message as VercelMessage, useChat as useVercelChat } from "ai/react"
import { useAction, useMutation, useQuery } from "convex/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useDebounce } from "use-debounce"
import { createNewMessage } from "@/panes/chat/chatUtils"
import { useBalanceStore } from "@/store/balance"
import { useModelStore } from "@/store/models"
import { useRepoStore } from "@/store/repo"
import { useToolStore } from "@/store/tools"
import { Chat as Thread, Message } from "@/types"
import { useUser } from "@clerk/nextjs"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { useChatStore } from "../../store/chat"

export function useChat({ propsId, onTitleUpdate }: { propsId?: Id<"threads">, onTitleUpdate?: (chatId: string) => void }) {
  const { user } = useUser()
  const [threadId, setThreadId] = useState<Id<"threads"> | null>(propsId || null)
  const [threadData, setThreadData] = useState<Thread>({
    id: '' as Id<"threads">,
    title: '',
    messages: [],
    createdAt: new Date(),
    userId: '' as Id<"users">,
    path: ''
  })
  const [error, setError] = useState<string | null>(null)
  const currentModelRef = useRef<string | null>(null)

  const { addMessageToThread, setThread, setCurrentThreadId } = useChatStore()
  const sendMessageMutation = useMutation(api.messages.saveChatMessage.saveChatMessage)
  const fetchMessages = useQuery(api.messages.fetchThreadMessages.fetchThreadMessages, threadId ? { thread_id: threadId } : "skip")
  const generateTitle = useAction(api.threads.generateTitle.generateTitle)
  const updateThreadData = useMutation(api.threads.updateThreadData.updateThreadData)
  const updateUserCreditsMutation = useMutation(api.users.updateUserCredits.updateUserCredits)

  const model = useModelStore((state) => state.model)
  const repo = useRepoStore((state) => state.repo)
  const tools = useToolStore((state) => state.tools)
  const setBalance = useBalanceStore((state) => state.setBalance)
  const balance = useBalanceStore((state) => state.balance)

  const vercelChatProps = useVercelChat({
    id: threadId?.toString(),
    initialMessages: threadData.messages as VercelMessage[],
    body: { model: model.id, tools, threadId, repoOwner: repo?.owner, repoName: repo?.name, repoBranch: repo?.branch },
    maxToolRoundtrips: 20,
    onFinish: async (message, options) => {
      if (threadId && user) {
        console.log("Whats up")
        const updatedMessages = [...threadData.messages, message as Message]
        setThreadData({ ...threadData, messages: updatedMessages })

        try {
          const result = await sendMessageMutation({
            thread_id: threadId,
            clerk_user_id: user.id,
            content: message.content,
            role: message.role,
            model_id: currentModelRef.current || model.id,
          })

          console.log("Result is", result)

          if (result && typeof result === 'object' && 'balance' in result) {
            const newBalance = result.balance as number
            console.log("About to set balance", newBalance)
            setBalance(newBalance)

            // Update user credits in the database
            await updateUserCreditsMutation({
              clerk_user_id: user.id,
              credits: newBalance,
            })
          }
          setError(null)

          // Generate or update title for every assistant message
          try {
            const title = await generateTitle({ threadId })
            setThreadData((prevThreadData) => ({
              ...prevThreadData,
              metadata: { ...prevThreadData.metadata, title },
            }))

            // Trigger the title update animation
            await updateThreadData({
              thread_id: threadId,
              metadata: { title }
            })
            if (onTitleUpdate) {
              onTitleUpdate(threadId)
            }
          } catch (error) {
            console.error('Error generating title:', error)
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

  // const [debouncedMessages] = useDebounce(vercelChatProps.messages, 25, { maxWait: 25 })
  const debouncedMessages = vercelChatProps.messages

  useEffect(() => {
    if (threadId && fetchMessages) {
      const thread: Thread = {
        id: threadId,
        title: 'New Chat',
        messages: fetchMessages as Message[],
        createdAt: threadData.createdAt || new Date(),
        userId: user?.id as Id<"users"> || '' as Id<"users">,
        path: ''
      }
      setThreadData(thread)
      setThread(threadId, thread)
    }
  }, [threadId, fetchMessages, setThread, user])

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
        model_id: model.id,
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
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
