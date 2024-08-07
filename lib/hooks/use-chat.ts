import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useChatStore } from '@/store/chat'
import { useRepoStore } from '@/store/repo'
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
    maxToolRoundtrips = 25,
    onToolCall
}: UseChatProps) {
    const router = useRouter()
    const path = usePathname()

    const {
        currentChatId,
        user: storeUser,
        setCurrentChatId,
        setUser: setStoreUser,
        getChatData,
        setMessages: setStoreMessages,
        setInput: setStoreInput
    } = useChatStore()

    const [localChatId, setLocalChatId] = useState<string | undefined>(initialId || currentChatId)
    const refreshedRef = useRef(false)

    useEffect(() => {
        if (initialId) setLocalChatId(initialId)
        if (initialUser) setStoreUser(initialUser)
    }, [initialId, initialUser, setStoreUser])

    useEffect(() => {
        if (localChatId) {
            setCurrentChatId(localChatId)
        }
    }, [localChatId, setCurrentChatId])

    const chatData = getChatData(localChatId || '')

    const repo = useRepoStore((state) => state.repo)

    const {
        messages: vercelMessages,
        input,
        handleInputChange,
        handleSubmit,
        addToolResult
    } = useVercelChat({
        initialMessages: initialMessages || chatData.messages,
        id: localChatId,
        maxToolRoundtrips,
        onToolCall,
        // If repo is defined, pass it to body
        body: repo ? {
            repoOwner: repo.owner,
            repoName: repo.name,
            repoBranch: repo.branch,
        } : undefined
    })

    useEffect(() => {
        if (storeUser) {
            if (!path.includes('chat') && vercelMessages.length === 1) {
                console.log("doing replace thing")
                window.history.replaceState({}, '', `/chat/${localChatId}`)
            }
        }
    }, [localChatId, path, storeUser, vercelMessages])

    useEffect(() => {
        if (vercelMessages.length === 2 && !refreshedRef.current) {
            // console.log("skipping refresh")
            // console.log('refreshing')
            // router.refresh()
            // refreshedRef.current = true
        }
    }, [vercelMessages, router])

    useEffect(() => {
        if (localChatId) {
            setStoreMessages(localChatId, vercelMessages)
        }
    }, [localChatId, vercelMessages, setStoreMessages])

    const handleInputChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(e)
        if (localChatId) {
            setStoreInput(localChatId, e.target.value)
        }
    }

    const handleSubmitWrapper = (e: React.FormEvent<HTMLFormElement>) => {
        refreshedRef.current = false
        handleSubmit(e)
    }

    return {
        messages: vercelMessages,
        input,
        id: localChatId,
        user: storeUser,
        handleInputChange: handleInputChangeWrapper,
        handleSubmit: handleSubmitWrapper,
        addToolResult,
        setMessages: (messages: Message[]) => {
            if (localChatId) {
                setStoreMessages(localChatId, messages)
            }
        },
        setId: setLocalChatId,
        setUser: setStoreUser
    }
}
