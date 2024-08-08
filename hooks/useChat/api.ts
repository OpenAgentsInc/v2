/**
 * @file hooks/useChat/api.ts
 * @description API functions for chat operations
 */

import { Message } from './types'
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

    console.log("Sending request with body:", requestBody)

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

    // Return the entire response object, which includes the body stream
    return response
}
