import { useEffect, useState, useRef, useCallback } from 'react'
import { useChatStore } from '@/store/chat'
import { useRepoStore } from '@/store/repo'
import { Message, User } from '@/lib/types'
import { useChat as useVercelChat } from 'ai/react'
import { saveChatMessage, createNewThread, fetchThreadMessages, updateThreadData } from '@/app/actions'

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
    const lastSavedMessageRef = useRef<string | null>(null)
    const isNewChatRef = useRef<boolean>(!initialId && !currentThreadId)

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

    const createNewThreadAction = useCallback(async (message: Message) => {
        if (storeUser) {
            console.log('Creating new thread for user:', storeUser.id)
            const result = await createNewThread(storeUser.id, message)
            console.log('New thread created:', result)
            const newThreadId = result.threadId.toString()
            setLocalThreadId(newThreadId)
            lastSavedMessageRef.current = message.content
            isNewChatRef.current = false
            return newThreadId
        }
        return null
    }, [storeUser])

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
            let threadId = localThreadId
            if (isNewChatRef.current) {
                threadId = await createNewThreadAction({ content: input, role: 'user' })
            }
            if (threadId && storeUser) {
                if (message.content !== lastSavedMessageRef.current) {
                    console.log('Saving message to thread:', threadId)
                    await saveChatMessage(threadId, storeUser.id, message)
                    lastSavedMessageRef.current = message.content
                    await updateThreadData(threadId, { lastMessage: message.content })
                }
            }
        }
    })

    const handleInputChangeWrapper = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(e)
        if (localThreadId) {
            setStoreInput(localThreadId, e.target.value)
        }
    }, [handleInputChange, localThreadId, setStoreInput])

    const handleSubmitWrapper = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isNewChatRef.current && storeUser) {
            const threadId = await createNewThreadAction({ content: input, role: 'user' })
            if (threadId) {
                setLocalThreadId(threadId)
            }
        }
        await handleSubmit(e)
        if (localThreadId) {
            const updatedMessages = await fetchThreadMessages(localThreadId)
            setStoreMessages(localThreadId, updatedMessages)
        }
    }, [handleSubmit, localThreadId, setStoreMessages, storeUser, input, createNewThreadAction])

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
                const newMessages = messages.filter(message => message.content !== lastSavedMessageRef.current)
                await Promise.all(newMessages.map(message => saveChatMessage(localThreadId, storeUser.id, message)))
                setStoreMessages(localThreadId, messages)
                if (newMessages.length > 0) {
                    lastSavedMessageRef.current = newMessages[newMessages.length - 1].content
                }
            }
        },
        setId: setLocalThreadId,
        setUser: setStoreUser
    }
}