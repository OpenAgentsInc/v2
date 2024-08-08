'use server'

import { saveMessage, createThread, getThreadMessages, updateThread, getUserThreads, getLastMessage } from '@/lib/db/queries'
import { Message } from '@/lib/types'

export async function saveChatMessage(threadId: string, clerkUserId: string, message: Message) {
    if (threadId) {
        const threadIdInt = parseInt(threadId)
        if (isNaN(threadIdInt)) {
            console.error("Invalid threadId:", threadId)
            return null
        }
        
        const lastMessage = await getLastMessage(threadIdInt)
        if (lastMessage && lastMessage.content === message.content) {
            console.log("Duplicate message, not saving:", message.content)
            return null
        }
        
        return await saveMessage(threadIdInt, clerkUserId, message)
    }
    return null
}

export async function createNewThread(clerkUserId: string, firstMessage: Message) {
    return await createThread(clerkUserId, firstMessage)
}

export async function fetchThreadMessages(threadId: string) {
    const threadIdInt = parseInt(threadId)
    if (isNaN(threadIdInt)) {
        console.error("Invalid threadId:", threadId)
        return []
    }
    return await getThreadMessages(threadIdInt)
}

export async function updateThreadData(threadId: string, metadata: any) {
    const threadIdInt = parseInt(threadId)
    if (isNaN(threadIdInt)) {
        console.error("Invalid threadId:", threadId)
        return null
    }
    return await updateThread(threadIdInt, { metadata })
}

export async function fetchUserThreads(userId: string) {
    console.log('Fetching user threads for userId:', userId)
    try {
        const threads = await getUserThreads(userId)
        console.log('Fetched threads:', threads)
        return threads
    } catch (error) {
        console.error('Error fetching user threads:', error)
        throw error
    }
}