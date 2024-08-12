'use client'

import * as React from 'react'
import { SidebarList } from './sidebar-list'
import { NewChatButton } from './new-chat-button'
import { Chat } from '@/types'

interface ChatHistoryProps {
    userId: string
    initialChats: Chat[]
}

export function ChatHistory({ userId, initialChats }: ChatHistoryProps) {
    const [chats, setChats] = React.useState<Chat[]>(initialChats)

    const addChat = React.useCallback((newChat: Chat) => {
        setChats(prevChats => [newChat, ...prevChats])
    }, [])

    return (
        <div className="flex flex-col h-full">
            <div className="mt-2 mb-2 px-2">
                <NewChatButton addChat={addChat} userId={userId} />
            </div>
            <React.Suspense
                fallback={
                    <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
                            />
                        ))}
                    </div>
                }
            >
                <SidebarList chats={chats} setChats={setChats} />
            </React.Suspense>
        </div>
    )
}