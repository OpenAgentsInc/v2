'use server'

import { sql } from '@vercel/postgres'
import { ServerActionResult } from '@/types'
import { auth } from '@clerk/nextjs/server'

export async function deleteThread(threadId: number): Promise<ServerActionResult<void>> {
    const { userId } = auth()

    try {
        const { userId } = auth()

        if (!userId) {
            return { success: false, error: 'User not authenticated' }
        }

        // Start a transaction
        await sql`BEGIN`

        // Check if the thread belongs to the authenticated user
        const threadOwner = await sql`
            SELECT clerk_user_id
            FROM threads
            WHERE id = ${threadId}
        `

        if (threadOwner.rows.length === 0 || threadOwner.rows[0].clerk_user_id !== userId) {
            await sql`ROLLBACK`
            return { success: false, error: 'Thread not found or user not authorized' }
        }

        // Delete messages associated with the thread
        await sql`
            DELETE FROM messages
            WHERE thread_id = ${threadId}
        `

        // Delete the thread
        await sql`
            DELETE FROM threads
            WHERE id = ${threadId}
        `

        // Commit the transaction
        await sql`COMMIT`

        return { success: true, data: undefined }
    } catch (error) {
        // Rollback the transaction in case of error
        await sql`ROLLBACK`
        console.error('Error deleting thread:', error)
        return { success: false, error: 'Failed to delete thread' }
    }
}
