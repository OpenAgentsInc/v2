"use client"

import { useState } from 'react'
import { useHudStore } from '@/store/hud'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { Chat } from '@/types'

interface NewChatButtonProps {
    addChat: (newChat: Chat) => void
    userId: string
    chats: Chat[]
}

export function NewChatButton({ addChat, userId, chats }: NewChatButtonProps) {
    const { addPane } = useHudStore()
    const [isCreating, setIsCreating] = useState(false)

    const handleNewChat = async () => {
        setIsCreating(true)
        try {
            const response = await fetch('/api/thread', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            if (!response.ok) throw new Error('Failed to create thread')
            const { threadId } = await response.json()
            
            // Check if the thread already exists in the chats
            const existingChat = chats.find(chat => chat.id === threadId)
            
            if (existingChat) {
                // If the chat already exists, just open it
                addPane({
                    type: 'chat',
                    title: existingChat.title,
                    paneProps: {
                        x: 300,
                        y: 20,
                        width: 600,
                        height: 400,
                    },
                    id: threadId
                })
            } else {
                // If it's a new chat, add it to the sidebar
                const newChat: Chat = {
                    id: threadId,
                    title: 'New Chat',
                    path: `/chat/${threadId}`,
                    createdAt: new Date().toISOString(),
                    messages: [],
                    userId: userId
                }
                addChat(newChat)

                addPane({
                    type: 'chat',
                    title: 'New Chat',
                    paneProps: {
                        x: 300,
                        y: 20,
                        width: 600,
                        height: 400,
                    },
                    id: threadId
                })
            }
        } catch (error) {
            console.error('Error creating new chat:', error)
            // Implement user-facing error handling here
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <button
            onClick={handleNewChat}
            disabled={isCreating}
            className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
            )}
        >
            <IconPlus className="-translate-x-2 stroke-2" />
            {isCreating ? 'Creating...' : 'New Chat'}
        </button>
    )
}