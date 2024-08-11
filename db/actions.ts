'use server'

import { sql } from '@vercel/postgres'
import { Message, Chat } from '@/types'

export async function getUserData(userId: string) {
    try {
        const { rows } = await sql`SELECT * FROM users WHERE clerk_user_id = ${userId}`;
        return rows[0];
    } catch (error) {
        console.error('Error in getUserData:', error);
        throw error;
    }
}

export async function getUserThreads(userId: string) {
    try {
        const { rows } = await sql`
        SELECT id, metadata, "createdAt"
        FROM threads
        WHERE clerk_user_id = ${userId}
        ORDER BY "createdAt" DESC
        `;
        return rows;
    } catch (error) {
        console.error('Error in getUserThreads:', error);
        throw error;
    }
}

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

export async function saveMessage(threadId: number, clerkUserId: string, message: Message) {
    try {
        const contentString = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
        const { rows } = await sql`
        INSERT INTO messages (thread_id, clerk_user_id, role, content, tool_invocations)
        VALUES (${threadId}, ${clerkUserId}, ${message.role}, ${contentString}, ${JSON.stringify(message.toolInvocations)}::jsonb)
        RETURNING id, created_at as "createdAt"
        `;
        return { ...message, id: rows[0].id, createdAt: rows[0].createdAt };
    } catch (error) {
        console.error('Error in saveMessage:', error);
        throw error;
    }
}

export async function createNewThread(clerkUserId: string, firstMessage: Message) {
    try {
        const contentString = typeof firstMessage.content === 'string' ? firstMessage.content : JSON.stringify(firstMessage.content);
        const title = contentString.substring(0, 100);
        const { rows: [thread] } = await sql`
        INSERT INTO threads (user_id, clerk_user_id, metadata)
        VALUES (
          (SELECT id FROM users WHERE clerk_user_id = ${clerkUserId}),
          ${clerkUserId},
          ${JSON.stringify({ title })}::jsonb
        )
        RETURNING id
        `;

        const savedMessage = await saveMessage(thread.id, clerkUserId, firstMessage);

        await sql`
        UPDATE threads
        SET first_message_id = ${savedMessage.id}
        WHERE id = ${thread.id}
        `;

        return { threadId: thread.id, message: savedMessage };
    } catch (error) {
        console.error('Error in createThread:', error);
        throw error;
    }
}

export async function fetchThreadMessages(threadId: number): Promise<Message[]> {
    console.log('Fetching messages for thread:', threadId)
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return []
    }
    try {
        const { rows } = await sql`
        SELECT id, role, content, created_at as "createdAt", tool_invocations as "toolInvocations"
        FROM messages
        WHERE thread_id = ${threadId}
        ORDER BY created_at ASC
        `;
        return rows.map(msg => ({
            id: msg.id.toString(),
            content: msg.content,
            role: msg.role as Message['role'],
            createdAt: msg.createdAt,
            toolInvocations: msg.toolInvocations
        }));
    } catch (error) {
        console.error('Error in getThreadMessages:', error);
        throw error;
    }
}

export async function updateThreadData(threadId: number, updates: Partial<Chat>) {
    console.log('Updating thread data:', { threadId, updates })
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return null
    }
    try {
        const { rows: [updatedThread] } = await sql`
        UPDATE threads
        SET
          metadata = COALESCE(${JSON.stringify(updates.metadata)}::jsonb, metadata)
        WHERE id = ${threadId}
        RETURNING id, metadata, "createdAt"
        `;
        console.log('Thread updated:', updatedThread)
        return updatedThread;
    } catch (error) {
        console.error('Error in updateThread:', error);
        throw error;
    }
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

export async function getChatById(threadId: number, userId: string) {
    const chatResult = await sql`
        SELECT * FROM threads WHERE id = ${threadId} AND user_id = ${userId}
    `;

    if (chatResult.rows.length === 0) {
        throw new Error('Chat not found');
    }

    return chatResult.rows[0];
}

export async function deleteThread(threadId: number) {
    try {
        await sql`DELETE FROM threads WHERE id = ${threadId}`;
    } catch (error) {
        console.error('Error in deleteThread:', error);
        throw error;
    }
}

export async function getLastMessage(threadId: number) {
    try {
        const { rows } = await sql`
        SELECT id, role, content, created_at as "createdAt", tool_invocations as "toolInvocations"
        FROM messages
        WHERE thread_id = ${threadId}
        ORDER BY created_at DESC
        LIMIT 1
        `;
        return rows[0] ? {
            id: rows[0].id.toString(),
            content: rows[0].content,
            role: rows[0].role as Message['role'],
            createdAt: rows[0].createdAt,
            toolInvocations: rows[0].toolInvocations
        } : null;
    } catch (error) {
        console.error('Error in getLastMessage:', error);
        throw error;
    }
}
