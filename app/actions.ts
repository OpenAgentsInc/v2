'use server'

import { saveMessage, createThread, getThreadMessages, updateThread, getUserThreads } from '@/lib/db/queries'
import { Message } from '@/lib/types'

export async function saveChatMessage(threadId: string, clerkUserId: string, message: Message) {
    if (threadId) {
        return await saveMessage(parseInt(threadId), clerkUserId, message)
    }
}

export async function createNewThread(clerkUserId: string, firstMessage: Message) {
    return await createThread(clerkUserId, firstMessage)
}

export async function fetchThreadMessages(threadId: string) {
    return await getThreadMessages(parseInt(threadId))
}

export async function updateThreadData(threadId: string, metadata: any) {
    console.log("Attempting to update thread data for threadId:", threadId)
    // This is returning errors so lets try the parse separately and console message and return if it dont work
    console.log("Attempting to update thread data for threadId:", parseInt(threadId))
    const threadIdInt = parseInt(threadId)
    console.log("Attempting to update thread data for threadId:", threadIdInt)
    if (!threadIdInt) {
        console.log("ThreadIdInt is falsey:", threadIdInt)
        return
    }
    return await updateThread(parseInt(threadId), { metadata })
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
