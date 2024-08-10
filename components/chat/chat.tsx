"use client"

import { useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { InputBar } from '@/components/input/InputBar'
import { ChatList } from './chat-list'

export interface ChatProps extends React.ComponentProps<'div'> {
    threadId: number
}

export const Chat = ({ threadId, className }: ChatProps) => {
    console.log('Chat', threadId)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const {
        messages,
        sendMessage
    } = useChat({ id: threadId })

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-auto" ref={chatContainerRef}>
                <ChatList messages={messages} />
            </div>
            <div className="flex-shrink-0 w-full">
                <div className="sticky bottom-0 w-full">
                    <InputBar onSubmit={sendMessage} />
                </div>
            </div>
        </div>
    )
}






