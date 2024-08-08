/**
 * @file hooks/useChat/api.ts
 * @description API functions for chat operations
 */

import { Message } from './types'

export async function sendChatRequest(messages: Message[]): Promise<Response> {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
}
