'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { useChat } from '@/lib/hooks/use-chat'
import { Message, User } from '@/lib/types'

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    user?: User | null
    missingKeys: string[]
}

export function Chat({ className, initialMessages, id: initialId, user: initialUser, missingKeys }: ChatProps) {
    const {
        messages,
        input,
        id,
        user,
        setInput
    } = useChat({ initialMessages, initialId, initialUser, missingKeys })

    const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
        useScrollAnchor()

    return (
        <div
            className="bg-white dark:bg-black group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
            ref={scrollRef}
        >
            <div
                className={cn('pb-[200px] pt-4 md:pt-10', className)}
                ref={messagesRef}
            >
                {messages.length ? (
                    <ChatList messages={messages} isShared={false} user={user} />
                ) : (
                    <EmptyScreen />
                )}
                <div className="w-full h-px" ref={visibilityRef} />
            </div>
            <ChatPanel
                id={id}
                input={input}
                setInput={setInput}
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />
        </div>
    )
}
