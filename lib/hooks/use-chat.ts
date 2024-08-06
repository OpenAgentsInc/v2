// lib/hooks/use-chat.ts

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useChatStore } from '@/store/chat'
import { Message, User } from '@/lib/types'
import { toast } from 'sonner'

interface UseChatProps {
    initialMessages?: Message[]
    initialId?: string
    initialUser?: User | null
    missingKeys: string[]
}

export function useChat({ initialMessages, initialId, initialUser, missingKeys }: UseChatProps) {
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
        setNewChatId(id)
    }, [id, setNewChatId])

    useEffect(() => {
        missingKeys.forEach(key => {
            toast.error(`Missing ${key} environment variable!`)
        })
    }, [missingKeys])

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
