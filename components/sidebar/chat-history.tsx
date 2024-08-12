'use client'

import * as React from 'react'
import { SidebarList } from './sidebar-list'
import { NewChatButton } from './new-chat-button'
import { Chat } from '@/types'
import { fetchUserThreads } from '@/db/actions'

interface ChatHistoryProps {
    userId: string
}

export function ChatHistory({ userId }: ChatHistoryProps) {
    const [chats, setChats] = React.useState<Chat[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        async function loadInitialChats() {
            try {
                const threads = await fetchUserThreads(userId)
                const formattedChats = threads.map((thread) => ({
                    id: thread.id,
                    title: thread.metadata?.title || 'Untitled Thread',
                    path: `/chat/${thread.id}`,
                    createdAt: thread.createdAt,
                    messages: [],
                    userId: userId,
                }))
                setChats(formattedChats)
            } catch (error) {
                console.error('Error fetching initial chats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadInitialChats()
    }, [userId])

    const addChat = React.useCallback((newChat: Chat) => {
        setChats(prevChats => [newChat, ...prevChats])
    }, [])

    return (
        <div className="flex flex-col h-full">
            <div className="mt-2 mb-2 px-2">
                <NewChatButton addChat={addChat} userId={userId} chats={chats} />
            </div>
            {isLoading ? (
                <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
                        />
                    ))}
                </div>
            ) : (
                <SidebarList chats={chats} setChats={setChats} />
            )}
        </div>
    )
}