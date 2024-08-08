import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useChatStore } from '@/store/chat'
import { useRepoStore } from '@/store/repo'
import { Message, User, Chat } from '@/lib/types'
import { useChat as useVercelChat } from 'ai/react'
import { saveChatMessage, createNewChat, fetchChatMessages, updateChatData } from '@/app/actions'

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
        body: repo ? {
            repoOwner: repo.owner,
            repoName: repo.name,
            repoBranch: repo.branch,
        } : undefined,
        onFinish: async (message) => {
            if (localChatId) {
                await saveChatMessage(localChatId, message)
            }
        }
    })

    useEffect(() => {
        if (storeUser && vercelMessages.length === 1) {
            const createNewChatAction = async () => {
                const newChat: Chat = {
                    id: localChatId || '',
                    title: vercelMessages[0].content.substring(0, 100),
                    createdAt: new Date(),
                    userId: storeUser.id,
                    path: path,
                    messages: vercelMessages
                }
                const { chatId } = await createNewChat(storeUser.id, newChat)
                setLocalChatId(chatId)
                window.history.replaceState({}, '', `/chat/${chatId}`)
            }
            createNewChatAction()
        }
    }, [localChatId, path, storeUser, vercelMessages])

    useEffect(() => {
        if (localChatId) {
            const updateMessages = async () => {
                await updateChatData(localChatId, { messages: vercelMessages })
            }
            updateMessages()
        }
    }, [localChatId, vercelMessages])

    const handleInputChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(e)
        if (localChatId) {
            setStoreInput(localChatId, e.target.value)
        }
    }

    const handleSubmitWrapper = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        refreshedRef.current = false
        await handleSubmit(e)
        if (localChatId) {
            const updatedMessages = await fetchChatMessages(localChatId)
            setStoreMessages(localChatId, updatedMessages)
        }
    }

    return {
        messages: vercelMessages,
        input,
        id: localChatId,
        user: storeUser,
        handleInputChange: handleInputChangeWrapper,
        handleSubmit: handleSubmitWrapper,
        addToolResult,
        setMessages: async (messages: Message[]) => {
            if (localChatId) {
                await updateChatData(localChatId, { messages })
                setStoreMessages(localChatId, messages)
            }
        },
        setId: setLocalChatId,
        setUser: setStoreUser
    }
}
