'use client'

import { Chat } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { useState, useCallback } from 'react'

import { SidebarActions } from './sidebar-actions'
import { SidebarItem } from './sidebar-item'
import { ServerActionResult } from '@/types'
import { deleteThread } from '@/db/actions/deleteThread'

interface SidebarItemsProps {
    chats: Chat[]
}

export function SidebarItems({ chats: initialChats }: SidebarItemsProps) {
    const [chats, setChats] = useState<Chat[]>(initialChats)

    const removeChatAsync = async (args: { id: number; path: string }): Promise<ServerActionResult<void>> => {
        const result = await deleteThread(args.id)
        if (result.success) {
            setChats(prevChats => prevChats.filter(chat => chat.id !== args.id))
        }
        return result
    }

    const addChat = useCallback((newChat: Chat) => {
        setChats(prevChats => [newChat, ...prevChats])
    }, [])

    if (!chats?.length) return null

    return (
        <AnimatePresence>
            {chats.map(
                (chat, index) =>
                    chat && (
                        <motion.div
                            key={chat?.id}
                            exit={{
                                opacity: 0,
                                height: 0
                            }}
                        >
                            <SidebarItem index={index} chat={chat}>
                                <SidebarActions
                                    chat={chat}
                                    removeChat={removeChatAsync}
                                />
                            </SidebarItem>
                        </motion.div>
                    )
            )}
        </AnimatePresence>
    )
}

export type { Chat }
export { addChat }