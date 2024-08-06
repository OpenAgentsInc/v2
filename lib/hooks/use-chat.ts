// lib/hooks/use-chat.ts

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useChatStore } from '@/store/chat'
import { Message, User } from '@/lib/types'

interface UseChatProps {
    initialMessages?: Message[]
    initialId?: string
    initialUser?: User
}

export function useChat({ initialMessages, initialId, initialUser }: UseChatProps) {
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

    return {
        messages,
        input,
        id,
        user,
        setInput,
        setMessages,
        setId,
        setUser
    }
}
