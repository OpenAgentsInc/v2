import { saveChatMessage } from '@/db/actions'
import { Message } from '@/types'

export async function onFinish(result: {
    threadId: number
    clerkUserId: string
    userMessage: Message
    assistantMessage: Message
}) {
    try {
        await saveChatMessage(result.threadId, result.clerkUserId, result.userMessage)
        await saveChatMessage(result.threadId, result.clerkUserId, result.assistantMessage)
    } catch (error) {
        console.error('Error in onFinish:', error)
    }
}
