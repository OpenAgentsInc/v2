'use server'

import { sql } from '@vercel/postgres'
import { saveMessage, createThread, getThreadMessages, updateThread, getUserThreads, getLastMessage } from './queries'
import { Message } from '@/lib/types'

export async function saveChatMessage(threadId: string, clerkUserId: string, message: Message) {
    // console.log('Saving chat message:', { threadId, clerkUserId, messageContent: message.content })
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

        const savedMessage = await saveMessage(threadIdInt, clerkUserId, message)
        console.log('Message saved:', savedMessage)
        return savedMessage
    }
    return null
}

export async function createNewThread(clerkUserId: string) {
    try {
        const { rows: [thread] } = await sql`
        INSERT INTO threads (user_id, clerk_user_id, metadata)
        VALUES (
          (SELECT id FROM users WHERE clerk_user_id = ${clerkUserId}),
          ${clerkUserId},
          ${JSON.stringify({})}::jsonb
        )
        RETURNING id
        `;

        return { threadId: thread.id };
    } catch (error) {
        console.error('Error in createThread:', error);
        throw error;
    }
}

export async function fetchThreadMessages(threadId: string) {
    console.log('Fetching messages for thread:', threadId)
    const threadIdInt = parseInt(threadId)
    if (isNaN(threadIdInt)) {
        console.error("Invalid threadId:", threadId)
        return []
    }
    const messages = await getThreadMessages(threadIdInt)
    console.log('Fetched messages:', messages.length)
    return messages
}

export async function updateThreadData(threadId: string, metadata: any) {
    console.log('Updating thread data:', { threadId, metadata })
    const threadIdInt = parseInt(threadId)
    if (isNaN(threadIdInt)) {
        console.error("Invalid threadId:", threadId)
        return null
    }
    const updatedThread = await updateThread(threadIdInt, { metadata })
    console.log('Thread updated:', updatedThread)
    return updatedThread
}

export async function fetchUserThreads(userId: string) {
    console.log('Fetching user threads for userId:', userId)
    try {
        const threads = await getUserThreads(userId)
        return threads
    } catch (error) {
        console.error('Error fetching user threads:', error)
        throw error
    }
}
