import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useChatStore } from '@/store/chat'
import { Message, User } from '@/lib/types'
import { useChat as useVercelChat } from 'ai/react'

interface UseChatProps {
    initialMessages?: Message[]
    initialId?: string
    initialUser?: User
    maxToolRoundtrips?: number
    onToolCall?: ({ toolCall }: { toolCall: any }) => Promise<any>
}

export function useChat({
    initialMessages,
    initialId,
    initialUser,
    maxToolRoundtrips = 5,
    onToolCall
}: UseChatProps) {
    const router = useRouter()
    const path = usePathname()

    const {
        messages: storeMessages,
        id: storeId,
        user: storeUser,
        setMessages: setStoreMessages,
        setId: setStoreId,
        setUser: setStoreUser
    } = useChatStore()

    const [localMessages, setLocalMessages] = useState<Message[]>(initialMessages || storeMessages)

    const {
        messages: vercelMessages,
        input,
        handleInputChange,
        handleSubmit,
        addToolResult
    } = useVercelChat({
        initialMessages: localMessages,
        id: storeId,
        maxToolRoundtrips,
        onToolCall
    })

    useEffect(() => {
        if (initialMessages) setLocalMessages(initialMessages)
        if (initialId) setStoreId(initialId)
        if (initialUser) setStoreUser(initialUser)
    }, [initialMessages, initialId, initialUser, setStoreMessages, setStoreId, setStoreUser])

    useEffect(() => {
        if (storeUser) {
            if (!path.includes('chat') && localMessages.length === 1) {
                window.history.replaceState({}, '', `/chat/${storeId}`)
            }
        }
    }, [storeId, path, storeUser, localMessages])

    useEffect(() => {
        const messagesLength = localMessages?.length
        if (messagesLength === 2) {
            router.refresh()
        }
    }, [localMessages, router])

    useEffect(() => {
        setLocalMessages(vercelMessages)
        setStoreMessages(vercelMessages)
    }, [vercelMessages, setStoreMessages])

    return {
        messages: localMessages,
        input,
        id: storeId,
        user: storeUser,
        handleInputChange,
        handleSubmit,
        addToolResult,
        setMessages: setLocalMessages,
        setId: setStoreId,
        setUser: setStoreUser
    }
}
