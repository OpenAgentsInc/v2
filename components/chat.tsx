'use client'
import React, { useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { useChat } from '@/hooks/useChat'
import { debounce } from 'lodash'

export interface ChatProps extends React.ComponentProps<'div'> {
    id?: string
}

export const Chat = React.memo(function Chat({ className, id: propId }: ChatProps) {
    console.log(`Chat component rendered with propId: ${propId}`);

    const {
        messages,
        input,
        id,
        handleInputChange,
        handleSubmit,
    } = useChat({ id: propId })

    console.log(`useChat hook returned id: ${id}`);

    const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
        useScrollAnchor()

    // Debounce the scrollToBottom function
    const debouncedScrollToBottom = useMemo(
        () => debounce(scrollToBottom, 100),
        [scrollToBottom]
    )

    // Ensure scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            debouncedScrollToBottom()
        }
    }, [messages, debouncedScrollToBottom])

    const chatPanelProps = useMemo(() => ({
        id,
        isAtBottom,
        scrollToBottom: debouncedScrollToBottom,
        input,
        handleInputChange,
        handleSubmit,
    }), [id, isAtBottom, debouncedScrollToBottom, input, handleInputChange, handleSubmit])

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
            <ChatPanel {...chatPanelProps} />
        </div>
    )
})
