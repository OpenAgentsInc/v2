'use client'

import { SidebarItems } from './sidebar-items'
import { Chat } from '@/types'

interface SidebarListProps {
    chats: Chat[] | undefined
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>
    newChatId: number | null
}

export function SidebarList({ chats, setChats, newChatId }: SidebarListProps) {
    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
                {chats && chats.length > 0 ? (
                    <div className="space-y-2 px-2">
                        <SidebarItems chats={chats} setChats={setChats} newChatId={newChatId} />
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