/**
 * @file hooks/useChat/utils.ts
 * @description Utility functions for chat operations
 */

import { Message } from './types'
import { nanoid } from 'lib/utils'

/**
 * Creates a new Message object with the given role and content.
 * 
 * @param role - The role of the message sender ('system', 'user', 'assistant', or 'data')
 * @param content - The text content of the message
 * @returns A new Message object with a generated id and current timestamp
 */
export const createMessage = (role: Message['role'], content: string): Message => ({
    id: nanoid(), // Generate a unique id for the message
    role,
    content,
    createdAt: new Date(), // Set the current timestamp
})

/**
 * Handles the streaming response from the chat API.
 * 
 * @param reader - The ReadableStreamDefaultReader to read the stream chunks
 * @param onUpdate - A callback function to handle updates as they come in
 */
export const handleStreamResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onUpdate: (content: string) => void
) => {
    const decoder = new TextDecoder() // Create a TextDecoder to convert Uint8Array to string
    let accumulatedMessage = '' // Variable to accumulate the incoming message

    while (true) {
        const { done, value } = await reader.read() // Read the next chunk from the stream
        if (done) break // If the stream is finished, exit the loop

        // Decode the chunk and add it to the accumulated message
        const chunkValue = decoder.decode(value, { stream: true })
        accumulatedMessage += chunkValue

        // Call the onUpdate callback with the current accumulated message
        onUpdate(accumulatedMessage)
    }
}

/**
 * Updates the messages array with new content from the assistant.
 * 
 * @param prevMessages - The current array of messages
 * @param content - The new content to be added or updated
 * @returns A new array of messages with the updated or new assistant message
 */
export const updateMessages = (
    prevMessages: Message[],
    content: string
): Message[] => {
    const updatedMessages = [...prevMessages] // Create a copy of the previous messages

    // Check if the last message is from the assistant
    if (updatedMessages[updatedMessages.length - 1]?.role === 'assistant') {
        // If so, update its content
        updatedMessages[updatedMessages.length - 1].content = content
    } else {
        // If not, add a new assistant message
        updatedMessages.push(createMessage('assistant', content))
    }

    return updatedMessages
}
