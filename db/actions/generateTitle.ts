'use server'
import { sql } from '@vercel/postgres'
import { Message } from '@/types'

export async function generateTitle(threadId: number): Promise<string> {

    console.log('fetching the messages')

    console.log("In generateTitle with messages:",);

    const dummyTitle = "This is a new thread";

    try {
        // Update the thread title in the database
        await sql`
      UPDATE threads
      SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{title}', ${JSON.stringify(dummyTitle)})
      WHERE id = ${threadId}
    `;

        return dummyTitle;
    } catch (error) {
        console.error('Error in generateTitle:', error);
        throw error;
    }
}
