/**
 * @file hooks/useChat/useChat.ts
 * @description Chat hook with streaming support. Import as { useChat } from "@/hooks/useChat"
 */
import { useState, useCallback, useMemo } from 'react'
import { Message, UseChatProps } from './types'
import { nanoid } from 'lib/utils'
import { sendChatRequest } from './api'
import { createMessage, handleStreamResponse, updateMessages } from './utils'

export function useChat({ id: propId }: UseChatProps = {}) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | undefined>()

    const id = useMemo(() => propId || nanoid(), [propId])

    const triggerRequest = useCallback(async (chatMessages: Message[]) => {
        setIsLoading(true)
        setError(undefined)
        try {
            const response = await sendChatRequest(chatMessages)
            const reader = response.body?.getReader()
            if (reader) {
                await handleStreamResponse(reader, (content) => {
                    setMessages(prevMessages => updateMessages(prevMessages, content))
                })
            } else {
                throw new Error('Failed to get response reader')
            }
        } catch (err) {
            console.error('Error in chat request:', err)
            setError(err instanceof Error ? err : new Error('An error occurred'))
        } finally {
            setIsLoading(false)
        }
    }, [])

    const append = useCallback((message: Omit<Message, 'id'>) => {
        const newMessage = createMessage(message.role, message.content)
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, newMessage]
            triggerRequest(updatedMessages)
            return updatedMessages
        })
    }, [triggerRequest])

    const handleSubmit = useCallback((e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault()
        if (!input) return
        const userMessage = createMessage('user', input)
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, userMessage]
            triggerRequest(updatedMessages)
            return updatedMessages
        })
        setInput('')
    }, [input, triggerRequest])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }, [])

    return {
        id,
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        error,
        append,
    }
}
