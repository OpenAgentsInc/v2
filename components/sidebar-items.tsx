'use client'

import { Chat } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import { ServerActionResult } from '@/lib/types'

const removeChatAsync = async (args: { id: number; path: string }): Promise<ServerActionResult<void>> => {
    console.log("Remove chat:", args)
    return { success: true, data: undefined }
}

const shareChatAsync = async (id: number): Promise<ServerActionResult<Chat>> => {
    console.log("Share chat:", id)
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
                                    removeChat={removeChatAsync}
                                    shareChat={shareChatAsync}
                                />
                            </SidebarItem>
                        </motion.div>
                    )
            )}
        </AnimatePresence>
    )
}