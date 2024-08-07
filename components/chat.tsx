'use client'

import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { useChat } from '@/lib/hooks/use-chat'
import { Message, User } from '@/lib/types'
import { ToolInvocation } from 'ai'

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    user?: User | undefined
}

export function Chat({ className, initialMessages, id: initialId, user: initialUser }: ChatProps) {
    const {
        messages,
        input,
        id,
        user,
        handleInputChange,
        handleSubmit,
        addToolResult
    } = useChat({
        initialMessages,
        initialId,
        initialUser,
        maxToolRoundtrips: 5,
        async onToolCall({ toolCall }) {
            if (toolCall.toolName === 'getLocation') {
                const cities = [
                    'New York',
                    'Los Angeles',
                    'Chicago',
                    'San Francisco',
                ]
                return cities[Math.floor(Math.random() * cities.length)]
            }
            // Add more tool call handlers here as needed
            console.log('Tool call:', toolCall)
        },
    })

    const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
        useScrollAnchor()

    const handleSubmitWrapper = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        handleSubmit(e)
    }

    const uiMessages = messages.map(message => ({
        ...message,
        toolInvocations: message.toolInvocations
    }))

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
                        <ChatList messages={uiMessages} user={user} isShared={false} />
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
                handleSubmit={handleSubmitWrapper}
            />
        </div>
    )
}
