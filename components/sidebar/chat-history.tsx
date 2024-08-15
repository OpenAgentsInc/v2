'use client'

import * as React from 'react'
import { SidebarList } from './sidebar-list'
import { NewChatButton } from './new-chat-button'
import { Chat } from '@/types'
import { useChatStore } from '@/store/chat'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

interface ChatHistoryProps {
    userId: string
}

export function ChatHistory({ userId }: ChatHistoryProps) {
    const { threads, setThread } = useChatStore()
    const [isLoading, setIsLoading] = React.useState(true)
    const [newChatId, setNewChatId] = useLocalStorage<Id<'threads'> | null>('newChatId2', null)

    const fetchedThreads = useQuery(api.threads.getUserThreads, { clerk_user_id: userId })

    React.useEffect(() => {
        if (fetchedThreads) {
            fetchedThreads.forEach((thread) => {
                setThread(thread._id, {
                    id: thread._id,
                    title: (thread.metadata as { title?: string })?.title || 'Untitled Thread',
                    messages: [],
                    createdAt: new Date(thread.createdAt),
                })
            })
            setIsLoading(false)
        }
    }, [fetchedThreads, setThread])

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
                <NewChatButton addChat={addChat} userId={userId} chats={sortedChats as Chat[]} />
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
                <SidebarList chats={sortedChats as Chat[]} setChats={() => { }} newChatId={newChatId as unknown as number | null} />
            )}
        </div>
    )
}