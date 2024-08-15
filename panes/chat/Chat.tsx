"use client"
import { useChat } from '@/hooks/useChat'
import { InputBar } from '@/components/input/InputBar'
import { ChatList } from './ChatList'
import { useChatScroll } from '@/hooks/useChatScroll';
import { Message } from '@/types';
import { Id } from '@/convex/_generated/dataModel'
import { Thread } from '@/panes/chat/chatUtils'

export interface ChatProps extends React.ComponentProps<'div'> {
    threadId: Id<"threads">
}

export const Chat = ({ threadId, className }: ChatProps) => {
    const {
        messages,
        sendMessage,
        isLoading
    } = useChat(threadId)

    const chatContainerRef = useChatScroll(messages);

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-auto" ref={chatContainerRef}>
                <ChatList messages={messages as Message[]} />
            </div>
            <div className="flex-shrink-0 w-full">
                <div className="sticky bottom-0 w-full">
                    <InputBar onSubmit={sendMessage} isLoading={isLoading} />
                </div>
            </div>
        </div>
    )
}