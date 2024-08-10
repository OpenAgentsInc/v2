"use client"

import { useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { InputBar } from '@/components/input/InputBar'
import { ChatList } from './chat-list'

export interface ChatProps extends React.ComponentProps<'div'> {
    chatId?: string | number
}

export const Chat = ({ chatId: propId, className }: ChatProps) => {
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const {
        messages,
        sendMessage
    } = useChat({ id: typeof propId === 'string' ? parseInt(propId, 10) : propId }) // remove?

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-auto" ref={chatContainerRef}>
                {messages.length ? <ChatList messages={messages} isShared={false} /> : <></>}
            </div>
            <div className="flex-shrink-0 w-full">
                <div className="sticky bottom-0 w-full">
                    <InputBar onSubmit={sendMessage} />
                </div>
            </div>
        </div>
    )
}






