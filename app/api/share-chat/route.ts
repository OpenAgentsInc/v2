import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { ServerActionResult, Chat } from '@/lib/types'

export async function POST(req: NextRequest): Promise<NextResponse<ServerActionResult<Chat>>> {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await req.json()

        // Verify that the chat belongs to the user
        const chatResult = await db.query(
            'SELECT * FROM threads WHERE id = $1 AND user_id = $2',
            [id, userId]
        )

        if (chatResult.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 })
        }

        const chat = chatResult.rows[0]

        // Generate a unique share link
        const shareId = Math.random().toString(36).substring(2, 15)
        const sharePath = `/share/${shareId}`

        // Save the share information
        await db.query(
            'INSERT INTO shared_chats (thread_id, share_id) VALUES ($1, $2)',
            [id, shareId]
        )

        // Return the chat data with the share path
        const sharedChat: Chat = {
            id: chat.id,
            title: chat.title || 'Shared Chat',
            messages: [], // We don't need to send messages here
            sharePath,
            createdAt: chat.created_at,
            userId: chat.user_id,
            path: `/chat/${chat.id}`
        }

        return NextResponse.json({ success: true, data: sharedChat })
    } catch (error) {
        console.error('Error sharing chat:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
