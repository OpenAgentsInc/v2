"use client"
import { useChat } from '@/hooks/useChat'
import { InputBar } from '@/components/input/InputBar'
import { ChatList } from './chat-list'
import { useChatScroll } from '@/hooks/useChatScroll';
import { Message } from '@/types';
import { useMemo } from 'react';
import { Id } from '@/convex/_generated/dataModel'

export interface ChatProps extends React.ComponentProps<'div'> {
    threadId: Id<"threads">
}

export const Chat = ({ threadId, className }: ChatProps) => {
    const {
        messages,
        sendMessage,
        isLoading,
        error
    } = useChat({ id: threadId })

    // Append error message to messages if it exists
    const messagesWithError = useMemo(() => {
        if (error) {
            return [
                ...messages,
                {
                    id: 'error-message',
                    content: error,
                    role: 'assistant' as const,
                    createdAt: new Date()
                } as Message
            ];
        }
        return messages;
    }, [messages, error]);

    const chatContainerRef = useChatScroll(messagesWithError);

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-auto" ref={chatContainerRef}>
                <ChatList messages={messagesWithError as Message[]} />
            </div>
            <div className="flex-shrink-0 w-full">
                <div className="sticky bottom-0 w-full">
                    <InputBar onSubmit={sendMessage} isLoading={isLoading} />
                </div>
            </div>
        </div>
    )
}