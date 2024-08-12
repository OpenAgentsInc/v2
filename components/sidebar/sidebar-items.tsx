'use client'

import { Chat } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'

import { SidebarActions } from './sidebar-actions'
import { SidebarItem } from './sidebar-item'
import { ServerActionResult } from '@/types'
import { deleteThread } from '@/db/actions/deleteThread'

const removeChatAsync = async (args: { id: number; path: string }): Promise<ServerActionResult<void>> => {
    const { userId } = useAuth()
    if (!userId) {
        return { success: false, error: 'User not authenticated' }
    }
    return await deleteThread(args.id, userId)
}

interface SidebarItemsProps {
    chats?: Chat[]
}

export function SidebarItems({ chats }: SidebarItemsProps) {
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
                                // shareChat={shareChatAsync}
                                />
                            </SidebarItem>
                        </motion.div>
                    )
            )}
        </AnimatePresence>
    )
}