import { sql } from '@vercel/postgres';
import { Message, Chat } from '@/lib/types';

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

export async function getThreadMessages(threadId: number) {
    try {
        const { rows } = await sql`
        SELECT id, role, content, created_at as "createdAt", tool_invocations as "toolInvocations"
        FROM messages
        WHERE thread_id = ${threadId}
        ORDER BY created_at ASC
        `;
        return rows;
    } catch (error) {
        console.error('Error in getThreadMessages:', error);
        throw error;
    }
}

export async function createThread(clerkUserId: string, firstMessage: Message) {
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

export async function updateThread(threadId: number, updates: Partial<Chat>) {
    try {
        const { rows: [updatedThread] } = await sql`
        UPDATE threads
        SET
          metadata = COALESCE(${JSON.stringify(updates.metadata)}::jsonb, metadata)
        WHERE id = ${threadId}
        RETURNING id, metadata, "createdAt"
        `;
        return updatedThread;
    } catch (error) {
        console.error('Error in updateThread:', error);
        throw error;
    }
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
        return rows[0];
    } catch (error) {
        console.error('Error in getLastMessage:', error);
        throw error;
    }
}

export async function getSharedChat(chatId: string) {
    try {
        const { rows } = await sql`
        SELECT t.id, t.metadata, t.created_at as "createdAt", t.share_path as "sharePath",
               json_agg(json_build_object('id', m.id, 'role', m.role, 'content', m.content, 'createdAt', m.created_at, 'toolInvocations', m.tool_invocations)) as messages
        FROM threads t
        LEFT JOIN messages m ON t.id = m.thread_id
        WHERE t.id = ${chatId}
        GROUP BY t.id
        `;
        return rows[0];
    } catch (error) {
        console.error('Error in getSharedChat:', error);
        throw error;
    }
}