'use server'
import { sql } from '@vercel/postgres'
import { saveMessage, createThread, getThreadMessages, updateThread, getUserThreads, getLastMessage, getSharedChat } from './queries'
import { Message, Chat } from '@/lib/types'

export async function saveChatMessage(threadId: number, clerkUserId: string, message: Message) {
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return null
    }
    const lastMessage = await getLastMessage(threadId)
    if (lastMessage && lastMessage.content === message.content) {
        console.log("Duplicate message, not saving:", message.content)
        return null
    }
    const savedMessage = await saveMessage(threadId, clerkUserId, message)
    console.log('Message saved:', savedMessage)
    return savedMessage
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

export async function fetchThreadMessages(threadId: number) {
    console.log('Fetching messages for thread:', threadId)
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return []
    }
    const messages = await getThreadMessages(threadId)
    console.log('Fetched messages:', messages.length)
    return messages
}

export async function updateThreadData(threadId: number, metadata: any) {
    console.log('Updating thread data:', { threadId, metadata })
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return null
    }
    const updatedThread = await updateThread(threadId, { metadata })
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

export async function getLastEmptyThread(clerkUserId: string) {
    try {
        const { rows } = await sql`
            SELECT t.id
            FROM threads t
            LEFT JOIN messages m ON t.id = m.thread_id
            WHERE t.clerk_user_id = ${clerkUserId}
            GROUP BY t.id
            HAVING COUNT(m.id) = 0
            ORDER BY (
                SELECT MAX(created_at) 
                FROM messages 
                WHERE thread_id = t.id
            ) DESC NULLS FIRST
            LIMIT 1
        `;
        return rows[0] ? rows[0].id : null;
    } catch (error) {
        console.error('Error in getLastEmptyThread:', error);
        throw error;
    }
}

export async function shareChat(threadId: number, userId: string) {
    const chatResult = await sql`
        SELECT * FROM threads WHERE id = ${threadId} AND user_id = ${userId}
    `;

    if (chatResult.rows.length === 0) {
        throw new Error('Chat not found');
    }

    const chat = chatResult.rows[0];
    const shareId = Math.random().toString(36).substring(2, 15);
    const sharePath = `/share/${shareId}`;

    await sql`
        INSERT INTO shared_chats (thread_id, share_id) VALUES (${threadId}, ${shareId})
    `;

    return {
        id: chat.id,
        title: chat.title || 'Shared Chat',
        messages: [],
        sharePath,
        createdAt: chat.created_at,
        userId: chat.user_id,
        path: `/chat/${chat.id}`
    };
}

export async function getChatById(threadId: number, userId: string) {
    const chatResult = await sql`
        SELECT * FROM threads WHERE id = ${threadId} AND user_id = ${userId}
    `;

    if (chatResult.rows.length === 0) {
        throw new Error('Chat not found');
    }

    return chatResult.rows[0];
}
