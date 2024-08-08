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

    const [localThreadId, setLocalThreadId] = useState<number | undefined>(
        initialId ? parseInt(initialId) : currentThreadId ? parseInt(currentThreadId) : undefined
    )
    const lastSavedMessageRef = useRef<string | null>(null)
    const isNewChatRef = useRef<boolean>(!initialId && !currentThreadId)

    useEffect(() => {
        console.log('useChat: Initial values', { initialId, currentThreadId, localThreadId, isNewChat: isNewChatRef.current })
        if (initialId) setLocalThreadId(parseInt(initialId))
        if (initialUser) setStoreUser(initialUser)
    }, [initialId, initialUser, setStoreUser, currentThreadId])

    useEffect(() => {
        if (localThreadId) {
            console.log('useChat: Setting current thread ID', localThreadId)
            setCurrentThreadId(localThreadId.toString())
        }
    }, [localThreadId, setCurrentThreadId])

    const threadData = getThreadData(localThreadId ? localThreadId.toString() : '')

    const repo = useRepoStore((state) => state.repo)

    const createNewThreadAction = useCallback(async (message: Message) => {
        if (storeUser) {
            console.log('Creating new thread for user:', storeUser.id)
            const result = await createNewThread(storeUser.id, message)
            console.log('New thread created:', result)
            const newThreadId = result.threadId
            console.log('Setting new thread ID:', newThreadId)
            setLocalThreadId(newThreadId)
            setCurrentThreadId(newThreadId.toString())
            lastSavedMessageRef.current = message.content
            isNewChatRef.current = false
            return newThreadId
        }
        return null
    }, [storeUser, setCurrentThreadId])

    const {
        messages: vercelMessages,
        input,
        handleInputChange,
        handleSubmit,
        addToolResult,
        setMessages
    } = useVercelChat({
        initialMessages: initialMessages || threadData.messages,
        id: localThreadId ? localThreadId.toString() : undefined,
        maxToolRoundtrips,
        onToolCall,
        body: repo ? {
            repoOwner: repo.owner,
            repoName: repo.name,
            repoBranch: repo.branch,
        } : undefined,
        onFinish: async (message) => {
            console.log('onFinish called', { localThreadId, isNewChat: isNewChatRef.current })
            let threadId = localThreadId
            if (isNewChatRef.current || !threadId) {
                threadId = await createNewThreadAction({ content: input, role: 'user' })
            }
            if (threadId && storeUser) {
                if (message.content !== lastSavedMessageRef.current) {
                    console.log('Saving message to thread:', threadId)
                    await saveChatMessage(threadId.toString(), storeUser.id, message)
                    lastSavedMessageRef.current = message.content
                    await updateThreadData(threadId.toString(), { lastMessage: message.content })
                }
            }
        }
    })

    const handleInputChangeWrapper = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(e)
        if (localThreadId) {
            setStoreInput(localThreadId.toString(), e.target.value)
        }
    }, [handleInputChange, localThreadId, setStoreInput])

    const handleSubmitWrapper = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('handleSubmitWrapper called', { isNewChat: isNewChatRef.current, localThreadId })
        if (isNewChatRef.current || !localThreadId) {
            const threadId = await createNewThreadAction({ content: input, role: 'user' })
            if (threadId) {
                console.log('New thread created in handleSubmitWrapper:', threadId)
                setLocalThreadId(threadId)
                setCurrentThreadId(threadId.toString())
                setMessages([{ role: 'user', content: input }])
            }
        }
        await handleSubmit(e)
        if (localThreadId) {
            const updatedMessages = await fetchThreadMessages(localThreadId.toString())
            setStoreMessages(localThreadId.toString(), updatedMessages)
        }
    }, [handleSubmit, localThreadId, setStoreMessages, storeUser, input, createNewThreadAction, setCurrentThreadId, setMessages])

    console.log('useChat: Current state', { localThreadId, isNewChat: isNewChatRef.current, messagesCount: vercelMessages.length })

    return {
        messages: vercelMessages,
        input,
        id: localThreadId ? localThreadId.toString() : undefined,
        user: storeUser,
        handleInputChange: handleInputChangeWrapper,
        handleSubmit: handleSubmitWrapper,
        addToolResult,
        setMessages: async (messages: Message[]) => {
            if (localThreadId && storeUser) {
                const newMessages = messages.filter(message => message.content !== lastSavedMessageRef.current)
                await Promise.all(newMessages.map(message => saveChatMessage(localThreadId.toString(), storeUser.id, message)))
                setStoreMessages(localThreadId.toString(), messages)
                if (newMessages.length > 0) {
                    lastSavedMessageRef.current = newMessages[newMessages.length - 1].content
                }
            }
            setMessages(messages)
        },
        setId: (id: string) => setLocalThreadId(parseInt(id)),
        setUser: setStoreUser
    }
}