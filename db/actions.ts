'use server'

import { sql } from '@vercel/postgres'
import { createThread, getThreadMessages, updateThread, getUserThreads, getLastMessage, getSharedChat } from './queries'
import { ChatMessage, ServerMessage, ClientMessage } from '@/lib/types'

export async function saveChatMessage(threadId: number, clerkUserId: string, message: ChatMessage) {
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return null
    }
    const lastMessage = await getLastMessage(threadId)
    if (lastMessage && lastMessage.content === message.content && lastMessage.role === message.role) {
        console.log("Potential duplicate message, saving anyway:", message.content)
    }
    const savedMessage = await saveMessage(threadId, clerkUserId, message)
    console.log('Message saved:', savedMessage)
    return savedMessage
}

// ... (rest of the file remains unchanged)

export async function saveMessage(threadId: number, clerkUserId: string, message: ChatMessage) {
  try {
    const { rows } = await sql`
      INSERT INTO messages (thread_id, clerk_user_id, content, role, created_at)
      VALUES (${threadId}, ${clerkUserId}, ${message.content.toString()}, ${message.role}, NOW())
      RETURNING id, created_at as "createdAt"
    `;
    return { ...message, id: rows[0].id.toString(), createdAt: rows[0].createdAt };
  } catch (error) {
    console.error('Error saving message:', error);
    throw new Error('Failed to save message');
  }
}