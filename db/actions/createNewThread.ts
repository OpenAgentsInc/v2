'use server'
import { sql } from '@vercel/postgres'
import { createOrGetUser } from './createOrGetUser'
import { currentUser } from '@clerk/nextjs/server'
import { getLastEmptyThread } from './getLastEmptyThread'

const RECENT_THREAD_THRESHOLD = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

export async function createNewThread() {
    try {
        // First, ensure the user exists
        const { userId } = await createOrGetUser();

        const user = await currentUser()
        if (!user) {
            throw new Error('No user found')
        }

        console.log("Checking for existing empty thread for user", user.id);

        // Check for an existing empty thread
        const existingEmptyThread = await getLastEmptyThread(user.id);

        if (existingEmptyThread) {
            const threadCreationTime = new Date(existingEmptyThread.createdAt).getTime();
            const currentTime = new Date().getTime();

            console.log('Existing empty thread found:', existingEmptyThread);
            console.log('Thread creation time:', new Date(threadCreationTime).toISOString());
            console.log('Current time:', new Date(currentTime).toISOString());
            console.log('Time difference:', currentTime - threadCreationTime);

            if (currentTime - threadCreationTime < RECENT_THREAD_THRESHOLD) {
                console.log('Reusing existing thread:', existingEmptyThread.id);
                return { threadId: existingEmptyThread.id };
            }
        }

        console.log("Creating a new thread for user", user.id);

        // Now create the thread
        const { rows: [thread] } = await sql`
            INSERT INTO threads (user_id, clerk_user_id, metadata)
            VALUES (
                ${userId},
                ${user.id},
                ${JSON.stringify({ title: 'New Thread' })}::jsonb
            )
            RETURNING id
        `;

        console.log("New thread created with ID:", thread.id);

        return { threadId: thread.id };
    } catch (error) {
        console.error('Error in createNewThread:', error);
        throw error;
    }
}