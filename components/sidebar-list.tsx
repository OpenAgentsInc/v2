import { SidebarItems } from '@/components/sidebar-items'
import { cache } from 'react'
import { fetchUserThreads } from '@/app/actions'
import { Chat } from '@/lib/types'
import { seed } from '@/lib/db/seed'

interface SidebarListProps {
    userId?: string
    children?: React.ReactNode
}

const loadThreads = cache(async (userId?: string) => {
    console.log('Loading threads for user:', userId)
    if (!userId) {
        return []
    }
    const threads = await fetchUserThreads(userId)
    console.log("Fetched threads:", threads)
    return threads
})

export async function SidebarList({ userId }: SidebarListProps) {
    console.log("In SidebarList with userId:", userId)
    await seed()
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