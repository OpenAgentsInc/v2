import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createNewThread, getLastEmptyThread } from '@/db/actions';

export const dynamic = 'force-dynamic';

const RECENT_THREAD_THRESHOLD = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST() {
    console.error('POST request received in /api/thread');
    try {
        // Authenticate the user
        const { userId } = auth();
        if (!userId) {
            console.error('User not authenticated');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Authenticated user ID:', userId);

        let existingEmptyThread = null;

        // Try to get the last empty thread, but don't fail if there's an error
        try {
            existingEmptyThread = await getLastEmptyThread(userId);
            console.error('Existing empty thread:', JSON.stringify(existingEmptyThread));
        } catch (error) {
            console.error('Error fetching last empty thread:', error);
            // Continue execution even if this fails
        }

        if (existingEmptyThread) {
            const threadCreationTime = new Date(existingEmptyThread.createdAt).getTime();
            const currentTime = new Date().getTime();

            console.error('Thread creation time:', new Date(threadCreationTime).toISOString());
            console.error('Current time:', new Date(currentTime).toISOString());
            console.error('Time difference:', currentTime - threadCreationTime);

            if (currentTime - threadCreationTime < RECENT_THREAD_THRESHOLD) {
                console.error('Reusing existing thread:', existingEmptyThread.id);
                return NextResponse.json({ threadId: existingEmptyThread.id }, { status: 200 });
            }
        }

        // If no recent empty thread exists or there was an error fetching it, create a new one
        console.error('Creating new thread');
        const result = await createNewThread();

        // Return the thread ID
        console.error('New thread created:', result.threadId);
        return NextResponse.json({ threadId: result.threadId }, { status: 201 });
    } catch (error) {
        console.error('Error handling thread request:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: (error as Error).message },
            { status: 500 }
        );
    }
}