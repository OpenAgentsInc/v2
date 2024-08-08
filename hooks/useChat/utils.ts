/**
 * @file hooks/useChat/utils.ts
 * @description Utility functions for chat operations
 */

import { Message } from './types'
import { nanoid } from 'lib/utils'

export const createMessage = (role: Message['role'], content: string): Message => ({
    id: nanoid(),
    role,
    content,
    createdAt: new Date(),
})

export const handleStreamResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onUpdate: (content: string) => void
) => {
    const decoder = new TextDecoder()
    let accumulatedMessage = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunkValue = decoder.decode(value, { stream: true })
        accumulatedMessage += chunkValue
        onUpdate(accumulatedMessage)
    }
}

export const updateMessages = (
    prevMessages: Message[],
    content: string
): Message[] => {
    const updatedMessages = [...prevMessages]
    if (updatedMessages[updatedMessages.length - 1].role === 'assistant') {
        updatedMessages[updatedMessages.length - 1].content = content
    } else {
        updatedMessages.push(createMessage('assistant', content))
    }
    return updatedMessages
}
