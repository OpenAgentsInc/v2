/**
 * @file hooks/useChat/api.ts
 * @description API functions for chat operations with proper ToolInvocation formatting
 */

import { Message, ToolInvocation } from './types'
import { useRepoStore } from '@/store/repo'

/**
 * Sends a chat request to the server and returns the response.
 * 
 * @param messages - An array of Message objects representing the chat history
 * @returns A Promise that resolves to the Response object from the fetch call
 * @throws Will throw an error if the HTTP response is not OK
 */
export async function sendChatRequest(messages: Message[]): Promise<Response> {
    // Get repo information from the repo store
    const repo = useRepoStore.getState().repo

    // Prepare the body with messages and repo information
    const requestBody = {
        messages,
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
        // Convert the requestBody to a JSON string for the request body
        body: JSON.stringify(requestBody),
    })

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Parse the response and format tool results
    const data = await response.json()

    if (data.toolResults) {
        data.toolResults = data.toolResults.map((result: any) => ({
            state: 'result',
            id: result.id,
            type: result.type,
            function: {
                name: result.function.name,
                arguments: result.function.arguments,
            },
            result: result.result
        } as ToolInvocation))
    }

    // Return a new response with the formatted data
    return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    })
}
