/**
 * @file hooks/useChat/useChat.ts
 * @description Chat hook. Import as { useChat } from "@/hooks/useChat"
 */
import { useState, useCallback, useMemo } from 'react'
import { Message, UseChatProps } from './types'
import { nanoid } from 'lib/utils'

export function useChat({ id: propId }: UseChatProps = {}) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | undefined>()

    // Generate a unique id for the chat if not provided
    const id = useMemo(() => propId || nanoid(), [propId])

    const triggerRequest = useCallback(async (chatMessages: Message[]) => {
        setIsLoading(true)
        setError(undefined)
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: chatMessages }),
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setMessages(prevMessages => [...prevMessages, data.message])
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'))
        } finally {
            setIsLoading(false)
        }
    }, [])

    const append = useCallback(async (message: Omit<Message, 'id'>) => {
        const newMessage: Message = {
            id: nanoid(),
            createdAt: new Date(),
            ...message,
        }
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, newMessage]
            triggerRequest(updatedMessages)
            return updatedMessages
        })
    }, [triggerRequest])

    const handleSubmit = useCallback((e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault()
        if (!input) return
        const userMessage: Message = {
            id: nanoid(),
            role: 'user',
            content: input,
            createdAt: new Date(),
        }
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
