/**
 * @file hooks/useChat/api.ts
 * @description API functions for chat operations with Vercel AI SDK stream handling
 */

import { JSONValue, Message, ToolInvocation } from './types'
import { useRepoStore } from '@/store/repo'

/**
 * Sends a chat request to the server and handles the streaming response using Vercel AI SDK.
 * 
 * @param messages - An array of Message objects representing the chat history
 * @returns A Promise that resolves to a function for handling the stream
 * @throws Will throw an error if the HTTP response is not OK
 */
export async function sendChatRequest(messages: Message[]): Promise<(onChunk: (chunk: any) => void) => Promise<void>> {
    // Get repo information from the repo store
    const repo = useRepoStore.getState().repo

    // Prepare the body with messages and repo information
    const requestBody = {
        messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            ...(msg.name && { name: msg.name }),
            ...(msg.function_call && { function_call: msg.function_call }),
        })),
        ...(repo ? {
            repoOwner: repo.owner,
            repoName: repo.name,
            repoBranch: repo.branch,
        } : {})
    }

    // Send a POST request to the chat API endpoint
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Return a function that handles the stream
    return async (onChunk: (chunk: any) => void) => {
        const reader = response.body?.getReader()
        if (!reader) {
            throw new Error('ReadableStream not supported')
        }

        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunkText = decoder.decode(value)
            const lines = chunkText.split('\n')

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6)
                    if (data === '[DONE]') {
                        return
                    }
                    try {
                        const parsed = JSON.parse(data)
                        onChunk(parsed)
                    } catch (e) {
                        console.error('Error parsing JSON:', e)
                    }
                }
            }
        }
    }
}

/**
 * Parses a tool invocation from the stream data.
 * 
 * @param data - The data chunk from the stream
 * @returns A ToolInvocation object if the data represents a tool call or result, otherwise null
 */
export function parseToolInvocation(data: JSONValue): ToolInvocation | null {
    if (typeof data === 'object' && data !== null) {
        if ('toolCall' in data) {
            const toolCall = data.toolCall as any
            return {
                state: 'call',
                toolCallId: toolCall.id,
                toolName: toolCall.name,
                args: toolCall.args
            }
        } else if ('toolResult' in data) {
            const toolResult = data.toolResult as any
            return {
                state: 'result',
                toolCallId: toolResult.toolCallId,
                toolName: toolResult.toolName,
                args: toolResult.args,
                result: toolResult.result
            }
        }
    }
    return null
}
