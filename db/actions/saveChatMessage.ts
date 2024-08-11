'use server'

import { Message, OnFinishOptions } from '@/types'
import { getLastMessage } from './getLastMessage'
import { saveMessage } from './saveMessage'

export async function saveChatMessage(threadId: number, clerkUserId: string, message: Message, options: OnFinishOptions) {
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return null
    }
    const lastMessage = await getLastMessage(threadId)
    if (lastMessage && lastMessage.content === message.content) {
        console.log("Duplicate message, not saving:", message.content)
        return null
    }
    const savedMessage = await saveMessage(threadId, clerkUserId, message, options)
    console.log('Message saved:', savedMessage)
    return savedMessage
}
