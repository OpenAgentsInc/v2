'use client'

import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { useChat } from '@/hooks/useChat'

export interface ChatProps extends React.ComponentProps<'div'> {
    id?: string
}

export function Chat({ className, id: propId }: ChatProps) {
    const {
        messages,
        input,
        id,
        handleInputChange,
        handleSubmit,
    } = useChat({ id: propId })

    const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
        useScrollAnchor()

    // Ensure scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom()
        }
    }, [messages, scrollToBottom])

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-white dark:bg-black group w-full",
                "transition-[padding,width] duration-300 ease-in-out",
                "pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]",
                "peer-[[data-workspace-open=true]]:w-3/5",
                className
            )}
        >
            <div className="flex-grow overflow-auto" ref={scrollRef}>
                <div className="relative min-h-full" ref={messagesRef}>
                    {messages.length ? (
                        <ChatList messages={messages} isShared={false} />
                    ) : (
                        <EmptyScreen />
                    )}
                    <div className="h-px" ref={visibilityRef} />
                </div>
            </div>
            <ChatPanel
                id={id}
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
            />
        </div>
    )
}
