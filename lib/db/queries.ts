import { sql } from '@vercel/postgres';
import { Message, Chat } from '@/lib/types';

export async function getUserData(userId: string) {
    const { rows } = await sql`SELECT * FROM users WHERE clerk_user_id = ${userId}`;
    return rows[0];
}

export async function getUserThreads(userId: string) {
    const { rows } = await sql`
    SELECT id, metadata, "createdAt"
    FROM threads
    WHERE clerk_user_id = ${userId}
    ORDER BY "createdAt" DESC
  `;
    return rows;
}

export async function saveMessage(threadId: number, clerkUserId: string, message: Message) {
    const { rows } = await sql`
    INSERT INTO messages (thread_id, clerk_user_id, role, content, tool_invocations)
    VALUES (${threadId}, ${clerkUserId}, ${message.role}, ${message.content}, ${JSON.stringify(message.toolInvocations)}::jsonb)
    RETURNING id, created_at as "createdAt"
  `;
    return { ...message, id: rows[0].id, createdAt: rows[0].createdAt };
}

export async function getThreadMessages(threadId: number) {
    const { rows } = await sql`
    SELECT id, role, content, created_at as "createdAt", tool_invocations as "toolInvocations"
    FROM messages
    WHERE thread_id = ${threadId}
    ORDER BY created_at ASC
  `;
    return rows;
}

export async function createThread(clerkUserId: string, firstMessage: Message) {
    const { rows: [thread] } = await sql`
    INSERT INTO threads (user_id, clerk_user_id, metadata)
    VALUES (
      (SELECT id FROM users WHERE clerk_user_id = ${clerkUserId}),
      ${clerkUserId},
      ${JSON.stringify({ title: firstMessage.content.substring(0, 100) })}::jsonb
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
}

export async function updateThread(threadId: number, updates: Partial<Chat>) {
    const { rows: [updatedThread] } = await sql`
    UPDATE threads
    SET
      metadata = COALESCE(${JSON.stringify(updates.metadata)}::jsonb, metadata)
    WHERE id = ${threadId}
    RETURNING id, metadata, "createdAt"
  `;
    return updatedThread;
}

export async function deleteThread(threadId: number) {
    await sql`DELETE FROM threads WHERE id = ${threadId}`;
}