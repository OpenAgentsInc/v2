/**
 * @file hooks/useChat/types.ts
 * @description Type definitions for the chat functionality
 */

/**
 * Represents a single message in the chat.
 */
export interface Message {
    /**
     * A unique identifier for the message.
     */
    id: string;

    /**
     * The timestamp when the message was created.
     * Optional, as it might not always be available or necessary.
     */
    createdAt?: Date;

    /**
     * The text content of the message.
     */
    content: string;

    /**
     * The role of the entity that sent the message.
     * - 'system': System messages or prompts
     * - 'user': Messages from the user
     * - 'assistant': Messages from the AI assistant
     * - 'data': Data-related messages (e.g., for displaying results)
     * 
     * Note: 'function' and 'tool' roles are deprecated and not included here.
     */
    role: 'system' | 'user' | 'assistant' | 'data';
}

/**
 * Props for initializing the useChat hook.
 */
export interface UseChatProps {
    /**
     * A unique identifier for the chat session.
     * If not provided, a random one will be generated.
     * When provided, the `useChat` hook with the same `id` will
     * have shared states across components.
     */
    id?: string;
}
