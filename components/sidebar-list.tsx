import { clearChats } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { redirect } from 'next/navigation'
import { cache } from 'react'

interface SidebarListProps {
    userId?: string
    children?: React.ReactNode
}

// TODO: Implement loadChats using Postgres
const loadChats = cache(async (userId?: string) => {
    console.log('Loading chats for user:', userId)
    return []
})

export async function SidebarList({ userId }: SidebarListProps) {
    const chats = await loadChats(userId)

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
                {chats?.length ? (
                    <div className="space-y-2 px-2">
                        <SidebarItems chats={chats} />
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
