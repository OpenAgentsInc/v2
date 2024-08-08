import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useChatStore } from '@/store/chat'
import { useRepoStore } from '@/store/repo'
import { Message, User } from '@/lib/types'
import { useChat as useVercelChat } from 'ai/react'
import { createThread, saveMessage, getThreadMessages, updateThread } from '@/lib/db/queries'

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
        currentThreadId,
        user: storeUser,
        setCurrentThreadId,
        setUser: setStoreUser,
        getThreadData,
        setMessages: setStoreMessages,
        setInput: setStoreInput
    } = useChatStore()

    const [localThreadId, setLocalThreadId] = useState<string | undefined>(initialId || currentThreadId)
    const refreshedRef = useRef(false)

    useEffect(() => {
        if (initialId) setLocalThreadId(initialId)
        if (initialUser) setStoreUser(initialUser)
    }, [initialId, initialUser, setStoreUser])

    useEffect(() => {
        if (localThreadId) {
            setCurrentThreadId(localThreadId)
        }
    }, [localThreadId, setCurrentThreadId])

    const threadData = getThreadData(localThreadId || '')

    const repo = useRepoStore((state) => state.repo)

    const {
        messages: vercelMessages,
        input,
        handleInputChange,
        handleSubmit,
        addToolResult
    } = useVercelChat({
        initialMessages: initialMessages || threadData.messages,
        id: localThreadId,
        maxToolRoundtrips,
        onToolCall,
        body: repo ? {
            repoOwner: repo.owner,
            repoName: repo.name,
            repoBranch: repo.branch,
        } : undefined,
        onFinish: async (message) => {
            if (localThreadId && storeUser) {
                await saveMessage(parseInt(localThreadId), storeUser.id, message)
            }
        }
    })

    useEffect(() => {
        if (storeUser && vercelMessages.length === 1) {
            const createNewThread = async () => {
                const { threadId } = await createThread(storeUser.id, vercelMessages[0])
                setLocalThreadId(threadId.toString())
                window.history.replaceState({}, '', `/chat/${threadId}`)
            }
            createNewThread()
        }
    }, [storeUser, vercelMessages])

    useEffect(() => {
        if (localThreadId) {
            const updateMessages = async () => {
                await updateThread(parseInt(localThreadId), { metadata: { lastMessage: vercelMessages[vercelMessages.length - 1].content } })
            }
            updateMessages()
        }
    }, [localThreadId, vercelMessages])

    const handleInputChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(e)
        if (localThreadId) {
            setStoreInput(localThreadId, e.target.value)
        }
    }

    const handleSubmitWrapper = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        refreshedRef.current = false
        await handleSubmit(e)
        if (localThreadId) {
            const updatedMessages = await getThreadMessages(parseInt(localThreadId))
            setStoreMessages(localThreadId, updatedMessages)
        }
    }

    return {
        messages: vercelMessages,
        input,
        id: localThreadId,
        user: storeUser,
        handleInputChange: handleInputChangeWrapper,
        handleSubmit: handleSubmitWrapper,
        addToolResult,
        setMessages: async (messages: Message[]) => {
            if (localThreadId && storeUser) {
                await Promise.all(messages.map(message => saveMessage(parseInt(localThreadId), storeUser.id, message)))
                setStoreMessages(localThreadId, messages)
            }
        },
        setId: setLocalThreadId,
        setUser: setStoreUser
    }
}