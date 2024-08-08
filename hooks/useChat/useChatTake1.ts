/**
 * @file hooks/useChat/useChat.ts
 * @description Chat hook with streaming support. Import as { useChat } from "@/hooks/useChat"
 */
import { useState, useCallback, useMemo, useRef } from 'react'
import { Message, UseChatProps, ToolInvocation } from './types'
import { nanoid } from 'lib/utils'
import { sendChatRequest, parseToolInvocation } from './api'
import { createMessage } from './utils'

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
    // Ref to store the current message being streamed
    const currentMessageRef = useRef<Message | null>(null)

    /**
     * Handles the streaming response from the chat API.
     * 
     * @param chatMessages - The current array of chat messages
     */
    const handleStreamResponse = useCallback(async (chatMessages: Message[]) => {
        setIsLoading(true)
        setError(undefined)
        try {
            const handleStream = await sendChatRequest(chatMessages)
            await handleStream((chunk) => {
                const toolInvocation = parseToolInvocation(chunk)
                if (toolInvocation) {
                    handleToolInvocation(toolInvocation)
                } else if (chunk.content) {
                    updateStreamedMessage(chunk.content)
                }
            })
        } catch (err) {
            console.error('Error in chat request:', err)
            setError(err instanceof Error ? err : new Error('An error occurred'))
        } finally {
            setIsLoading(false)
            currentMessageRef.current = null
        }
    }, [])

    /**
     * Updates the current streamed message or creates a new one.
     * 
     * @param content - The new content to append to the message
     */
    const updateStreamedMessage = useCallback((content: string) => {
        setMessages(prevMessages => {
            const lastMessage = prevMessages[prevMessages.length - 1]
            if (lastMessage && lastMessage.role === 'assistant' && currentMessageRef.current === lastMessage) {
                // Update existing message
                const updatedMessage = { ...lastMessage, content: lastMessage.content + content }
                currentMessageRef.current = updatedMessage
                return [...prevMessages.slice(0, -1), updatedMessage]
            } else {
                // Create new message
                const newMessage = createMessage('assistant', content)
                currentMessageRef.current = newMessage
                return [...prevMessages, newMessage]
            }
        })
    }, [])

    /**
     * Handles tool invocations received from the stream.
     * 
     * @param toolInvocation - The tool invocation to handle
     */
    const handleToolInvocation = useCallback((toolInvocation: ToolInvocation) => {
        setMessages(prevMessages => {
            const lastMessage = prevMessages[prevMessages.length - 1]
            if (lastMessage && lastMessage.role === 'assistant') {
                // Append tool invocation to the last assistant message
                const updatedMessage = {
                    ...lastMessage,
                    toolInvocations: [...(lastMessage.toolInvocations || []), toolInvocation]
                }
                return [...prevMessages.slice(0, -1), updatedMessage]
            } else {
                // Create a new assistant message with the tool invocation
                const newMessage = createMessage('assistant', '', [toolInvocation])
                return [...prevMessages, newMessage]
            }
        })
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
            handleStreamResponse(updatedMessages)
            return updatedMessages
        })
    }, [handleStreamResponse])

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
            handleStreamResponse(updatedMessages)
            return updatedMessages
        })
        setInput('') // Clear the input after submission
    }, [input, handleStreamResponse])

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
