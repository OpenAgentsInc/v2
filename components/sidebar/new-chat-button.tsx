"use client"

import { useState } from 'react'
import { useHudStore } from '@/store/hud'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { Chat } from '@/types'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

interface NewChatButtonProps {
    addChat: (newChat: Chat) => void
    userId: string
    clerkUserId: string
    chats: Chat[]
}

export function NewChatButton({ addChat, userId, clerkUserId, chats }: NewChatButtonProps) {
    const { openChatPane } = useHudStore()
    const [isCreating, setIsCreating] = useState(false)
    const createNewThread = useMutation(api.threads.createNewThread)

    const handleNewChat = async (event: React.MouseEvent) => {
        setIsCreating(true)
        try {
            console.log('Attempting to create new thread');
            const newThread = await createNewThread({
                user_id: userId,
                clerk_user_id: clerkUserId,
                metadata: {}
            })
            console.log('Received new thread:', newThread);

            if (newThread) {
                console.log('Creating new chat for thread:', newThread._id);
                const newChat: Chat = {
                    id: newThread._id,
                    title: 'New Chat',
                    path: `/chat/${newThread._id}`,
                    createdAt: new Date(newThread.createdAt),
                    messages: [],
                    userId: userId
                }
                addChat(newChat)

                openChatPane({
                    id: newThread._id,
                    title: 'New Chat',
                    type: 'chat',
                })
            } else {
                console.error('Failed to create new thread');
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