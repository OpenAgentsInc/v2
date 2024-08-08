/**
 * @file hooks/useChat/useChat.ts
 * @description Chat hook with streaming support. Import as { useChat } from "@/hooks/useChat"
 */
import { useState, useCallback, useMemo } from 'react'
import { Message, UseChatProps } from './types'
import { nanoid } from 'lib/utils'
import { sendChatRequest } from './api'
import { createMessage, handleStreamResponse, updateMessages } from './utils'

/**
 * A custom React hook for managing chat state and interactions.
 * 
 * @param props - The props for initializing the chat hook
 * @returns An object containing chat state and functions to interact with the chat
 */
export function useChat({ id: propId }: UseChatProps = {}) {
    // State for storing chat messages
    const [messages, setMessages] = useState<Message[]>([])
    // State for storing the current input value
    const [input, setInput] = useState<string>("")
    // State for tracking whether a request is in progress
    const [isLoading, setIsLoading] = useState<boolean>(false)
    // State for storing any error that occurs during the chat
    const [error, setError] = useState<Error | undefined>()

    // Generate a unique id for the chat if not provided
    const id = useMemo(() => propId || nanoid(), [propId])

    /**
     * Sends a request to the chat API and handles the streaming response.
     * 
     * @param chatMessages - The current array of chat messages
     */
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

    /**
     * Appends a new message to the chat and triggers a new request.
     * 
     * @param message - The message to be appended (without an id)
     */
    const append = useCallback((message: Omit<Message, 'id'>) => {
        const newMessage = createMessage(message.role, message.content)
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, newMessage]
            triggerRequest(updatedMessages)
            return updatedMessages
        })
    }, [triggerRequest])

    /**
     * Handles the submission of a new user message.
     * 
     * @param e - The form submission event (optional)
     */
    const handleSubmit = useCallback((e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault()
        if (!input) return
        const userMessage = createMessage('user', input)
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, userMessage]
            triggerRequest(updatedMessages)
            return updatedMessages
        })
        setInput('') // Clear the input after submission
    }, [input, triggerRequest])

    /**
     * Handles changes to the input field.
     * 
     * @param e - The change event from the input field
     */
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }, [])

    // Return an object with all the necessary state and functions
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
