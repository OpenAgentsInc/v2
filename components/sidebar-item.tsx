'use client'

import * as React from 'react'

import { motion } from 'framer-motion'

import { buttonVariants } from '@/components/ui/button'
import { IconMessage, IconUsers } from '@/components/ui/icons'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { type Chat } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useHudStore } from '@/store/hud'

interface SidebarItemProps {
    index: number
    chat: Chat
    children: React.ReactNode
}

export function SidebarItem({ index, chat, children }: SidebarItemProps) {
    const { panes, addPane, setChatOpen } = useHudStore()
    const isActive = panes.some(pane => pane.id === chat.id && pane.type === 'chat')
    const [newChatId, setNewChatId] = useLocalStorage('newChatId2', null)
    const shouldAnimate = index === 0 && isActive && newChatId

    if (!chat?.id) return null

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!isActive) {
            addPane({
                id: chat.id,
                title: chat.title,
                type: 'chat',
                content: { oldContent: chat.messages?.join('\n') }
            })
        }
        setChatOpen(true)
    }

    return (
        <motion.div
            className="relative h-8"
            variants={{
                initial: {
                    height: 0,
                    opacity: 0
                },
                animate: {
                    height: 'auto',
                    opacity: 1
                }
            }}
            initial={shouldAnimate ? 'initial' : undefined}
            animate={shouldAnimate ? 'animate' : undefined}
            transition={{
                duration: 0.25,
                ease: 'easeIn'
            }}
        >
            <div className="absolute left-2 top-1 flex size-6 items-center justify-center">
                {chat.sharePath ? (
                    <Tooltip delayDuration={1000}>
                        <TooltipTrigger
                            tabIndex={-1}
                            className="focus:bg-muted focus:ring-1 focus:ring-ring"
                        >
                            <IconUsers className="mr-2 mt-1 text-zinc-500" />
                        </TooltipTrigger>
                        <TooltipContent>This is a shared chat.</TooltipContent>
                    </Tooltip>
                ) : (
                    <IconMessage className="mr-2 mt-1 text-zinc-500" />
                )}
            </div>
            <button
                onClick={handleClick}
                className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    isActive && 'bg-zinc-200 pr-16 font-semibold dark:bg-zinc-800',
                    'text-left' // Add this class to left-align the text
                )}
            >
                <div
                    className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
                    title={chat.title}
                >
                    <span className="whitespace-nowrap">
                        {shouldAnimate ? (
                            chat.title.split('').map((character, index) => (
                                <motion.span
                                    key={index}
                                    variants={{
                                        initial: {
                                            opacity: 0,
                                            x: -100
                                        },
                                        animate: {
                                            opacity: 1,
                                            x: 0
                                        }
                                    }}
                                    initial={shouldAnimate ? 'initial' : undefined}
                                    animate={shouldAnimate ? 'animate' : undefined}
                                    transition={{
                                        duration: 0.25,
                                        ease: 'easeIn',
                                        delay: index * 0.05,
                                        staggerChildren: 0.05
                                    }}
                                    onAnimationComplete={() => {
                                        if (index === chat.title.length - 1) {
                                            setNewChatId(null)
                                        }
                                    }}
                                >
                                    {character}
                                </motion.span>
                            ))
                        ) : (
                            <span>{chat.title}</span>
                        )}
                    </span>
                </div>
            </button>
            {isActive && <div className="absolute right-2 top-1">{children}</div>}
        </motion.div>
    )
}