'use client'

import React from 'react'
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
        },
    })

    console.log("messages in Chat:", messages)

    const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
        useScrollAnchor()

    const handleSubmitWrapper = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        handleSubmit(e)
    }

    const renderToolInvocation = (toolInvocation: ToolInvocation) => {
        const toolCallId = toolInvocation.toolCallId
        const addResult = (result: string) =>
            addToolResult({ toolCallId, result })

        if (toolInvocation.toolName === 'askForConfirmation') {
            return (
                <div key={toolCallId}>
                    {toolInvocation.args.message}
                    <div>
                        {'result' in toolInvocation ? (
                            <b>{toolInvocation.result}</b>
                        ) : (
                            <>
                                <button onClick={() => addResult('Yes')}>Yes</button>
                                <button onClick={() => addResult('No')}>No</button>
                            </>
                        )}
                    </div>
                </div>
            )
        }

        return 'result' in toolInvocation ? (
            <div key={toolCallId}>
                Tool call {`${toolInvocation.toolName}: `}
                {toolInvocation.result}
            </div>
        ) : (
            <div key={toolCallId}>Calling {toolInvocation.toolName}...</div>
        )
    }

    const uiMessages = messages.map(message => ({
        ...message,
        display: (
            <div className="mb-4">
                <strong>{message.role}:</strong> {message.content}
                {message.toolInvocations?.map(renderToolInvocation)}
            </div>
        )
    }))

    return (
        <div
            className={cn("bg-white dark:bg-black group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]", className)}
            ref={scrollRef}
        >
            <div
                className="pb-[200px] pt-4 md:pt-10"
                ref={messagesRef}
            >
                {messages.length ? (
                    <ChatList messages={uiMessages} user={user} isShared={false} />
                ) : (
                    <EmptyScreen />
                )}
                <div className="w-full h-px" ref={visibilityRef} />
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
