import { Message as VercelMessage, useChat as useVercelChat } from "ai/react"
import { useAction, useMutation, useQuery } from "convex/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { createNewMessage } from "@/panes/chat/chatUtils"
import { useBalanceStore } from "@/store/balance"
import { useModelStore } from "@/store/models"
import { useRepoStore } from "@/store/repo"
import { useToolStore } from "@/store/tools"
import { Chat as Thread, Message } from "@/types"
import { ToolInvocation } from "@/types/tool-invocation"
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
  const saveMessageAndUpdateBalance = useMutation(api.users.saveMessageAndUpdateBalance.saveMessageAndUpdateBalance)

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
            model_id: currentModelRef.current || model.id,
            tool_invocations: message.toolInvocations as ToolInvocation[],
          })

          if (options && options.usage) {
            const balanceResult = await saveMessageAndUpdateBalance({
              clerk_user_id: user.id,
              model_id: currentModelRef.current || model.id,
              usage: options.usage,
            })

            if (balanceResult && 'newBalance' in balanceResult) {
              setBalance(balanceResult.newBalance)
            }
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

  const debouncedMessages = vercelChatProps.messages

  useEffect(() => {
    if (threadId && fetchMessages) {
      const thread: Thread = {
        id: threadId,
        title: 'New Chat',
        messages: fetchMessages.map((message: any) => ({
          ...message,
          toolInvocations: message.tool_invocations ? message.tool_invocations.map((invocation: ToolInvocation) => ({
            ...invocation,
            args: typeof invocation.args === 'string' ? JSON.parse(invocation.args) : invocation.args,
            result: invocation.state === 'result' ? (typeof invocation.result === 'string' ? JSON.parse(invocation.result) : invocation.result) : undefined,
          })) : undefined,
        })) as Message[],
        createdAt: threadData.createdAt || new Date(),
        userId: user?.id as Id<"users"> || '' as Id<"users">,
        path: ''
      }
      console.log('Rehydrated thread:', thread);
      setThreadData(thread)
      setThread(threadId, thread)
    }
  }, [threadId, fetchMessages, setThread, user])

  const sendMessage = useCallback(async (content: string) => {
    if (!threadId || !user) {
      console.error('No thread ID or user available')
      return
    }

    // Remove the message combination logic
    const newMessage = createNewMessage(threadId, user.id, content)
    addMessageToThread(threadId, newMessage)

    try {
      vercelChatProps.append(newMessage as VercelMessage)
      await sendMessageMutation({
        thread_id: threadId,
        clerk_user_id: user.id,
        content: content,
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
    stop: vercelChatProps.stop,
  }
}