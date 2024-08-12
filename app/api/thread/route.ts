import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createNewThread, getLastEmptyThread } from '@/db/actions';

export const dynamic = 'force-dynamic';

const RECENT_THREAD_THRESHOLD = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST() {
    try {
        // Authenticate the user
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let existingEmptyThread = null;

        // Try to get the last empty thread, but don't fail if there's an error
        try {
            existingEmptyThread = await getLastEmptyThread(userId);
        } catch (error) {
            console.error('Error fetching last empty thread:', error);
            // Continue execution even if this fails
        }

        if (existingEmptyThread) {
            const threadCreationTime = new Date(existingEmptyThread.createdAt).getTime();
            const currentTime = new Date().getTime();

            if (currentTime - threadCreationTime < RECENT_THREAD_THRESHOLD) {
                return NextResponse.json({ threadId: existingEmptyThread.id }, { status: 200 });
            }
        }

        // If no recent empty thread exists or there was an error fetching it, create a new one
        const result = await createNewThread();

        // Return the thread ID
        return NextResponse.json({ threadId: result.threadId }, { status: 201 });
    } catch (error) {
        console.error('Error handling thread request:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: (error as Error).message },
            { status: 500 }
        );
    }
}