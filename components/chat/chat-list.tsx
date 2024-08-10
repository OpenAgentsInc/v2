import { Separator } from '@/components/ui/separator'
import { Message } from '@/lib/types'
import { ChatMessage } from './chat-message'

export interface ChatListProps {
    messages: Message[]
}

export function ChatList({ messages }: ChatListProps) {
    if (!messages.length) {
        return null
    }

    return (
        <div className="overflow-y-scroll pt-6 px-20 w-full">
            {messages.map((message, index) => (
                <div key={message.id}>
                    <ChatMessage message={message as any} />
                    {index < messages.length - 1 && <Separator className="my-4" />}
                </div>
            ))}
        </div>
    )
}
