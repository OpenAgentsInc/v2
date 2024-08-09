'use client'

import { Chat } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import { ServerActionResult } from '@/lib/types'

const removeChatAsync = async (args: { id: string; path: string }): Promise<ServerActionResult<void>> => {
    console.log("Remove chat:", args)
    return Promise.resolve({ success: true, data: undefined })
}

const shareChatAsync = async (id: string): Promise<ServerActionResult<Chat>> => {
    console.log("Share chat:", id)
    return Promise.reject({ success: false, error: "Not implemented" })
}

const removeChat = (args: { id: string; path: string }): ServerActionResult<void> => {
    removeChatAsync(args)
    return { success: true, data: undefined }
}

const shareChat = (id: string): ServerActionResult<Chat> => {
    shareChatAsync(id)
    return { success: false, error: "Not implemented" }
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
                                    removeChat={removeChat}
                                    shareChat={shareChat}
                                />
                            </SidebarItem>
                        </motion.div>
                    )
            )}
        </AnimatePresence>
    )
}