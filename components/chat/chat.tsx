"use client"

import { useChat } from '@/hooks/useChat'
import { InputBar } from '@/components/input/InputBar'
import { ChatList } from './chat-list'
import { useChatScroll } from '@/hooks/useChatScroll';

export interface ChatProps extends React.ComponentProps<'div'> {
    threadId: number
}

export const Chat = ({ threadId, className }: ChatProps) => {
    const {
        messages,
        sendMessage,
        isLoading
    } = useChat({ id: threadId })
    const chatContainerRef = useChatScroll(messages);
    console.log(messages)

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-auto" ref={chatContainerRef}>
                <ChatList messages={messages} />
            </div>
            <div className="flex-shrink-0 w-full">
                <div className="sticky bottom-0 w-full">
                    <InputBar onSubmit={sendMessage} isLoading={isLoading} />
                </div>
            </div>
        </div>
    )
}






