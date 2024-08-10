import { useEffect, useRef } from 'react'
import { Separator } from '@/components/ui/separator'
import { Message } from '@/lib/types'
import { ChatMessage } from './chat-message'

export interface ChatListProps {
    messages: Message[]
    loadMoreMessages: () => void
    hasMore: boolean
    isLoading: boolean
}

export function ChatList({ messages, loadMoreMessages, hasMore, isLoading }: ChatListProps) {
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMoreMessages()
                }
            },
            { threshold: 1.0 }
        )

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current)
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [loadMoreMessages, hasMore, isLoading])

    if (!messages.length) {
        return null
    }

    const reversedMessages = [...messages].reverse()

    return (
        <div className="overflow-y-scroll pt-6 px-20 w-full">
            {hasMore && (
                <div ref={loadMoreRef} className="text-center py-2">
                    {isLoading ? 'Loading...' : 'Load more'}
                </div>
            )}
            {reversedMessages.map((message, index) => (
                <div key={message.id}>
                    <ChatMessage message={message as any} />
                    {index < reversedMessages.length - 1 && <Separator className="my-4" />}
                </div>
            ))}
        </div>
    )
}