'use client'

import * as React from 'react'
import { SidebarList } from './sidebar-list'
import { NewChatButton } from './new-chat-button'
import { Chat } from '@/types'
import { fetchUserThreads } from '@/db/actions'
import { useChatStore } from '@/store/chat'

interface ChatHistoryProps {
    userId: string
}

export function ChatHistory({ userId }: ChatHistoryProps) {
    const { threads, setThread } = useChatStore()
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        async function loadInitialChats() {
            try {
                const fetchedThreads = await fetchUserThreads(userId)
                fetchedThreads.forEach((thread) => {
                    setThread(thread.id, {
                        id: thread.id,
                        title: thread.metadata?.title || 'Untitled Thread',
                        messages: [],
                    })
                })
            } catch (error) {
                console.error('Error fetching initial chats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadInitialChats()
    }, [userId, setThread])

    const addChat = React.useCallback((newChat: Chat) => {
        setThread(newChat.id, {
            id: newChat.id,
            title: newChat.title,
            messages: [],
        })
    }, [setThread])

    const chats = Object.values(threads).map(thread => ({
        id: thread.id,
        title: thread.title,
        path: `/chat/${thread.id}`,
        createdAt: new Date(), // You might want to add createdAt to your Thread type
        messages: thread.messages,
        userId: userId,
    }))

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
                <SidebarList chats={chats} setChats={() => {}} />
            )}
        </div>
    )
}