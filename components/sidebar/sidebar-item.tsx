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
import { type Chat } from '@/types'
import { cn } from '@/lib/utils'
import { useHudStore } from '@/store/hud'
import { useChatStore } from '@/hooks/useChatStore'

interface SidebarItemProps {
    index: number
    chat: Chat
    children: React.ReactNode
    isNew: boolean
}

export function SidebarItem({ index, chat, children, isNew }: SidebarItemProps) {
    const { panes, addPane, setChatOpen, bringPaneToFront } = useHudStore()
    const { setCurrentThreadId } = useChatStore()
    const isActive = React.useMemo(() => 
        panes.some(pane => pane.id === chat.id && pane.type === 'chat' && pane.isActive),
        [panes, chat.id]
    )
    const isOpen = React.useMemo(() => 
        panes.some(pane => pane.id === chat.id && pane.type === 'chat'),
        [panes, chat.id]
    )
    const shouldAnimate = isNew && index === 0

    if (!chat?.id) return null

    const handleClick = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        const existingPane = panes.find(pane => pane.id === chat.id && pane.type === 'chat')

        if (existingPane) {
            bringPaneToFront(existingPane.id)
        } else {
            const newPane = {
                id: chat.id,
                title: chat.title,
                type: 'chat' as const,
                content: { id: chat.id, oldContent: chat.messages?.join('\n') }
            }
            addPane(newPane, e.metaKey || e.ctrlKey)
        }
        setChatOpen(true)
        setCurrentThreadId(chat.id)
    }, [panes, chat, bringPaneToFront, addPane, setChatOpen, setCurrentThreadId])

    return (
        <motion.div
            className="relative h-10 mb-1"
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
            initial={shouldAnimate ? 'initial' : false}
            animate={shouldAnimate ? 'animate' : false}
            transition={{
                duration: 0.25,
                ease: 'easeIn'
            }}
        >
            <div className="absolute left-2 top-2 flex size-6 items-center justify-center">
                {chat.sharePath ? (
                    <Tooltip delayDuration={1000}>
                        <TooltipTrigger
                            tabIndex={-1}
                            className="focus:bg-muted focus:ring-1 focus:ring-ring"
                        >
                            <IconUsers className="text-zinc-500" />
                        </TooltipTrigger>
                        <TooltipContent>This is a shared chat.</TooltipContent>
                    </Tooltip>
                ) : (
                    <IconMessage className="text-zinc-500" />
                )}
            </div>
            <button
                onClick={handleClick}
                className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'group w-full h-10 px-10 py-2 transition-colors hover:bg-white/10',
                    isOpen && 'bg-zinc-200 dark:bg-zinc-800',
                    isActive && 'pr-16 font-semibold',
                    'text-left'
                )}
            >
                <div
                    className="relative max-h-6 flex-1 select-none overflow-hidden text-ellipsis break-all"
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
                                    initial="initial"
                                    animate="animate"
                                    transition={{
                                        duration: 0.25,
                                        ease: 'easeIn',
                                        delay: index * 0.05,
                                        staggerChildren: 0.05
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
            {isActive && <div className="absolute right-2 top-2">{children}</div>}
        </motion.div>
    )
}