import { Separator } from '@/components/ui/separator'
import { Message, User } from '@/lib/types'
import { ChatMessage } from '@/components/chat-message'

export interface ChatListProps {
    messages: Message[]
    user?: User
    isShared: boolean
}

export function ChatList({ messages, user, isShared }: ChatListProps) {
    if (!messages.length) {
        return null
    }

    return (
        <div className="overflow-y-scroll relative mx-auto max-w-2xl px-4">
            {messages.map((message, index) => (
                <div key={message.id}>
                    <ChatMessage message={message as any} />
                    {index < messages.length - 1 && <Separator className="my-4" />}
                </div>
            ))}
        </div>
    )
}
