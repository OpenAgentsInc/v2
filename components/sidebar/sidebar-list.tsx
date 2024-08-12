import { SidebarItems } from './sidebar-items'
import { cache } from 'react'
import { fetchUserThreads } from '@/db/actions'
import { Chat } from '@/types'

interface SidebarListProps {
    userId?: string
    children?: React.ReactNode
}

const loadThreads = cache(async (userId?: string) => {
    if (!userId) {
        console.log('No userId provided, returning empty array')
        return []
    }
    try {
        const threads = await fetchUserThreads(userId)
        return threads
    } catch (error) {
        console.error("Error fetching threads:", error)
        return []
    }
})

export async function SidebarList({ userId }: SidebarListProps) {
    const threads = await loadThreads(userId)
    const formattedThreads = threads.map((thread) => {
        return {
            id: thread.id,
            title: thread.metadata?.title || 'Untitled Thread',
            path: `/chat/${thread.id}`,
            createdAt: thread.createdAt,
            messages: [],
            userId: userId,
        } as Chat
    })
    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
                {formattedThreads.length ? (
                    <div className="space-y-2 px-2">
                        <SidebarItems chats={formattedThreads} />
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">No chat history</p>
                    </div>
                )}
            </div>
        </div>
    )
}