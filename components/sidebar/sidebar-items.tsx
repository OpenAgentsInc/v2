'use client'

import { Chat } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'

import { SidebarActions } from './sidebar-actions'
import { SidebarItem } from './sidebar-item'
import { ServerActionResult } from '@/types'
import { deleteThread } from '@/db/actions/deleteThread'

interface SidebarItemsProps {
    chats: Chat[]
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>
    newChatId: number | null
}

export function SidebarItems({ chats, setChats, newChatId }: SidebarItemsProps) {
    const removeChatAsync = async (args: { id: number; path: string }): Promise<ServerActionResult<void>> => {
        const result = await deleteThread(args.id)
        if (result.success) {
            setChats(prevChats => prevChats.filter(chat => chat.id !== args.id))
        }
        return result
    }

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
                            <SidebarItem 
                                index={index} 
                                chat={chat} 
                                isNew={chat.id === newChatId}
                            >
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