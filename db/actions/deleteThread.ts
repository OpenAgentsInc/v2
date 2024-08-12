'use server'

import { sql } from '@vercel/postgres'
import { ServerActionResult } from '@/types'

export async function deleteThread(threadId: number, userId: string): Promise<ServerActionResult<void>> {
    try {
        // Start a transaction
        await sql`BEGIN`

        // Delete messages associated with the thread
        await sql`
            DELETE FROM messages
            WHERE thread_id = ${threadId}
        `

        // Delete the thread
        const result = await sql`
            DELETE FROM threads
            WHERE id = ${threadId} AND clerk_user_id = ${userId}
        `

        // Commit the transaction
        await sql`COMMIT`

        if (result.rowCount === 0) {
            return { success: false, error: 'Thread not found or user not authorized' }
        }

        return { success: true, data: undefined }
    } catch (error) {
        // Rollback the transaction in case of error
        await sql`ROLLBACK`
        console.error('Error deleting thread:', error)
        return { success: false, error: 'Failed to delete thread' }
    }
}