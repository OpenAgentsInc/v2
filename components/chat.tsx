'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect } from 'react'
import { Message, User } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { useChatStore } from '@/store/chat'

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    user?: User | null
    missingKeys: string[]
}

export function Chat({ className, initialMessages, id: initialId, user: initialUser, missingKeys }: ChatProps) {
    const router = useRouter()
    const path = usePathname()

    const {
        messages,
        input,
        id,
        user,
        setMessages,
        setInput,
        setId,
        setUser
    } = useChatStore()

    const [_, setNewChatId] = useLocalStorage('newChatId', id)

    useEffect(() => {
        if (initialMessages) setMessages(initialMessages)
        if (initialId) setId(initialId)
        if (initialUser) setUser(initialUser)
    }, [initialMessages, initialId, initialUser, setMessages, setId, setUser])

    useEffect(() => {
        if (user) {
            if (!path.includes('chat') && messages.length === 1) {
                window.history.replaceState({}, '', `/chat/${id}`)
            }
        }
    }, [id, path, user, messages])

    useEffect(() => {
        const messagesLength = messages?.length
        if (messagesLength === 2) {
            router.refresh()
        }
    }, [messages, router])

    useEffect(() => {
        setNewChatId(id)
    }, [id, setNewChatId])

    useEffect(() => {
        missingKeys.forEach(key => {
            toast.error(`Missing ${key} environment variable!`)
        })
    }, [missingKeys])

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
