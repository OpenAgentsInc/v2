"use client"

import { useState } from 'react'
import { useHudStore } from '@/store/hud'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { Chat } from '@/types'
import { createNewThread } from '@/db/actions/createNewThread'

interface NewChatButtonProps {
    addChat: (newChat: Chat) => void
    userId: string
    chats: Chat[]
}

export function NewChatButton({ addChat, userId, chats }: NewChatButtonProps) {
    const { openChatPane } = useHudStore()
    const [isCreating, setIsCreating] = useState(false)

    const handleNewChat = async (event: React.MouseEvent) => {
        setIsCreating(true)
        try {
            console.log('Attempting to create new thread');
            const { threadId } = await createNewThread(true) // Force creation of a new thread
            console.log('Received threadId:', threadId);

            console.log('Creating new chat for thread:', threadId);
            const newChat: Chat = {
                id: threadId,
                title: 'New Chat',
                path: `/chat/${threadId}`,
                createdAt: new Date().toISOString(),
                messages: [],
                userId: userId
            }
            addChat(newChat)

            openChatPane({
                id: threadId,
                title: 'New Chat',
                type: 'chat',
            })
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