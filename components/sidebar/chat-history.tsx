'use client'

import * as React from 'react'
import { SidebarList } from './sidebar-list'
import { NewChatButton } from './new-chat-button'
import { Chat } from '@/types'
import { fetchUserThreads } from '@/db/actions'
import { useChatStore } from '@/store/chat'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

interface ChatHistoryProps {
    userId: string
}

export function ChatHistory({ userId }: ChatHistoryProps) {
    const { threads, setThread } = useChatStore()
    const [isLoading, setIsLoading] = React.useState(true)
    const [newChatId, setNewChatId] = useLocalStorage<string | null>('newChatId2', null)

    React.useEffect(() => {
        async function loadInitialChats() {
            try {
                const fetchedThreads = await fetchUserThreads(userId)
                fetchedThreads.forEach((thread) => {
                    setThread(thread.id, {
                        id: thread.id,
                        title: thread.metadata?.title || 'Untitled Thread',
                        messages: [],
                        createdAt: new Date(thread.createdAt),
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
            createdAt: new Date(),
        })
        setNewChatId(newChat.id)
    }, [setThread, setNewChatId])

    const sortedChats = React.useMemo(() => {
        return Object.values(threads)
            .sort((a, b) => {
                const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
                const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
                return timeB - timeA;
            })
            .map(thread => ({
                id: thread.id,
                title: thread.title,
                path: `/chat/${thread.id}`,
                createdAt: thread.createdAt,
                messages: thread.messages,
                userId: userId,
            }))
    }, [threads, userId])

    return (
        <div className="flex flex-col h-full">
            <div className="mt-2 mb-2 px-2">
                <NewChatButton addChat={addChat} userId={userId} chats={sortedChats} />
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
                <SidebarList chats={sortedChats} setChats={() => { }} newChatId={newChatId} />
            )}
        </div>
    )
}