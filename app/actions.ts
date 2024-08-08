'use server'

import { saveMessage, createThread, getThreadMessages, updateThread, getUserData, getUserThreads } from '@/lib/db/queries'
import { Message, User } from '@/lib/types'

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
    return await updateThread(parseInt(threadId), { metadata })
}

export async function fetchUserData(userId: string) {
    return await getUserData(userId)
}

export async function fetchUserThreads(userId: string) {
    return await getUserThreads(userId)
}