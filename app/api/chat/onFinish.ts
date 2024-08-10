import { saveChatMessage } from '@/db/actions'
import { Message, ChatMessage } from '@/lib/types'

export async function onFinish(result: {
  threadId: number
  clerkUserId: string
  userMessage: Message
  assistantMessage: Message
}) {
  try {
    await saveChatMessage(result.threadId, result.clerkUserId, result.userMessage as ChatMessage)
    await saveChatMessage(result.threadId, result.clerkUserId, result.assistantMessage as ChatMessage)
  } catch (error) {
    console.error('Error in onFinish:', error)
  }
}