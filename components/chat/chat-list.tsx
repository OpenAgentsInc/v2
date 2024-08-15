import { Separator } from '@/components/ui/separator'
import { Message } from '@/types'
import { ChatMessage } from './chat-message'

export interface ChatListProps {
    messages: Message[]
}

export function ChatList({ messages }: ChatListProps) {
    if (!messages.length) {
        return null
    }

    return (
        <div className="overflow-y-scroll p-6 px-12 -ml-4 w-full">
            {messages.map((message, index) => (
                <div key={`${message.id}-${index}`}>
                    <ChatMessage key={`message-${message.id}-${index}`} message={message} />
                    {index < messages.length - 1 && <Separator key={`separator-${index}`} className="my-4" />}
                </div>
            ))}
        </div>
    )
}