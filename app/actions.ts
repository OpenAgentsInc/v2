'use server'

import { saveMessage, createThread, getThreadMessages, updateThread } from '@/lib/db/queries'
import { Message } from '@/lib/types'

export async function saveChatMessage(threadId: string, clerkUserId: string, message: Message) {
    if (threadId) {
        await saveMessage(parseInt(threadId), clerkUserId, message)
    }
}

export async function createNewThread(clerkUserId: string, firstMessage: Message) {
    return await createThread(clerkUserId, firstMessage)
}

export async function fetchThreadMessages(threadId: string) {
    return await getThreadMessages(parseInt(threadId))
}

export async function updateThreadData(threadId: string, metadata: any) {
    await updateThread(parseInt(threadId), { metadata })
}