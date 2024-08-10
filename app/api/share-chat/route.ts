import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { shareChat, getChatById } from '@/db/actions'
import { ServerActionResult, Chat } from '@/lib/types'

export async function POST(req: NextRequest): Promise<NextResponse<ServerActionResult<Chat>>> {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await req.json()

        // Verify that the chat belongs to the user
        const chat = await getChatById(id, userId)

        // Generate a unique share link and save the share information
        const sharedChat = await shareChat(id, userId)

        return NextResponse.json({ success: true, data: sharedChat })
    } catch (error) {
        console.error('Error sharing chat:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
