import { SidebarItems } from '@/components/sidebar-items'
import { cache } from 'react'
import { getUserThreads } from 'lib/db/queries'
import { Chat } from '@/lib/types'

interface SidebarListProps {
    userId?: string
    children?: React.ReactNode
}

const loadChats = cache(async (userId?: string) => {
    console.log('Loading chats for user:', userId)
    if (!userId) {
        return []
    }
    const threads = await getUserThreads(userId)
    console.log("Fetched threads:", threads)
    return threads
})

export async function SidebarList({ userId }: SidebarListProps) {
    console.log("In SidebarList with userId:", userId)
    const chats = await loadChats(userId)
    const formattedChats = chats.map((chat) => {
        return {
            id: chat.id,
            title: chat.metadata.title,
            path: "/chat/" + chat.id,
            createdAt: chat.createdAt,
            messages: [],
            userId: chat.clerk_user_id,
        } as Chat
    })

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
                {chats?.length ? (
                    <div className="space-y-2 px-2">
                        <SidebarItems chats={formattedChats} />
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
