import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createNewThread } from '@/db/actions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Authenticate the user
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create a new thread
        const result = await createNewThread(userId);

        // Return the new thread ID
        return NextResponse.json({ threadId: result.threadId }, { status: 201 });
    } catch (error) {
        console.error('Error creating new thread:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: (error as Error).message },
            { status: 500 }
        );
    }
}
