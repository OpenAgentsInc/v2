'use server'

import { CustomMessage } from '@/lib/types';
import { sql } from '@vercel/postgres';

export async function createNewThread() {
  try {
    const result = await sql`
      INSERT INTO threads (created_at)
      VALUES (NOW())
      RETURNING id
    `;
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating new thread:', error);
    throw new Error('Failed to create a new thread');
  }
}

export async function fetchThreadMessages(threadId: number) {
  try {
    const result = await sql`
      SELECT * FROM messages
      WHERE thread_id = ${threadId}
      ORDER BY created_at ASC
    `;
    return result.rows.map(row => ({
      id: row.id,
      content: row.content,
      role: row.role,
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    throw new Error('Failed to fetch thread messages');
  }
}

export async function saveMessage(threadId: number, message: CustomMessage) {
  try {
    await sql`
      INSERT INTO messages (thread_id, content, role, created_at)
      VALUES (${threadId}, ${message.content}, ${message.role}, NOW())
    `;
  } catch (error) {
    console.error('Error saving message:', error);
    throw new Error('Failed to save message');
  }
}