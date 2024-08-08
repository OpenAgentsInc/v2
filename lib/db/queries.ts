import { sql } from '@vercel/postgres';
import { Message, Chat } from '@/lib/types';

export async function getUserData(userId: string) {
    const { rows } = await sql`SELECT * FROM users WHERE id = ${userId}`;
    return rows[0];
}

export async function getUserChats(clerkUserId: string) {
    const { rows } = await sql`
    SELECT t.id, t.metadata, t."createdAt", m.content as "firstMessageContent"
    FROM threads t
    LEFT JOIN messages m ON t.first_message_id = m.id
    WHERE t.clerk_user_id = ${clerkUserId}
    ORDER BY t."createdAt" DESC
    `;
    return rows;
}

export async function saveMessage(chatId: string, message: Message) {
    const { rows } = await sql`
    INSERT INTO messages (id, chat_id, role, content, created_at, tool_invocations)
    VALUES (${message.id}, ${chatId}, ${message.role}, ${message.content}, ${message.createdAt}, ${JSON.stringify(message.toolInvocations)}::jsonb)
    RETURNING id, created_at as "createdAt"
  `;
    return { ...message, id: rows[0].id, createdAt: rows[0].createdAt };
}

export async function getChatMessages(chatId: string) {
    const { rows } = await sql`
    SELECT id, role, content, created_at as "createdAt", tool_invocations as "toolInvocations"
    FROM messages
    WHERE chat_id = ${chatId}
    ORDER BY created_at ASC
  `;
    return rows;
}

export async function createChat(userId: string, chat: Chat) {
    const { rows: [newChat] } = await sql`
    INSERT INTO chats (id, title, created_at, user_id, path, share_path)
    VALUES (${chat.id}, ${chat.title}, ${chat.createdAt}, ${userId}, ${chat.path}, ${chat.sharePath})
    RETURNING id
  `;

    const savedMessages = await Promise.all(chat.messages.map(message => saveMessage(newChat.id, message)));

    return { chatId: newChat.id, messages: savedMessages };
}

export async function updateChat(chatId: string, updates: Partial<Chat>) {
    const { rows: [updatedChat] } = await sql`
    UPDATE chats
    SET
      title = COALESCE(${updates.title}, title),
      path = COALESCE(${updates.path}, path),
      share_path = COALESCE(${updates.sharePath}, share_path)
    WHERE id = ${chatId}
    RETURNING id, title, created_at as "createdAt", user_id as "userId", path, share_path as "sharePath"
  `;
    return updatedChat;
}

export async function deleteChat(chatId: string) {
    await sql`DELETE FROM chats WHERE id = ${chatId}`;
}
