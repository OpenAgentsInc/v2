/**
 * @file hooks/useChat/types.ts
 * @description Type definitions for the chat functionality
 */

/**
A JSON value can be a string, number, boolean, object, array, or null.
JSON values can be serialized and deserialized by the JSON.stringify and JSON.parse methods.
*/
export type JSONValue =
    | null
    | string
    | number
    | boolean
    | { [value: string]: JSONValue }
    | Array<JSONValue>;

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

    /**
     * Tool invocations that the assistant made as part of this message.
     */
    toolInvocations?: Array<ToolInvocation>;
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

/**
 * Tool invocations are either tool calls or tool results. For each assistant tool call,
 * there is one tool invocation. While the call is in progress, the invocation is a tool call.
 * Once the call is complete, the invocation is a tool result.
 */
export type ToolInvocation =
    | ({ state: 'partial-call' } & CoreToolCall<string, any>)
    | ({ state: 'call' } & CoreToolCall<string, any>)
    | ({ state: 'result' } & CoreToolResult<string, any, any>);

/**
 * Typed tool call that is returned by generateText and streamText. 
 * It contains the tool call ID, the tool name, and the tool arguments. 
 */
export interface CoreToolCall<NAME extends string, ARGS> {
    /**
     * ID of the tool call. This ID is used to match the tool call with the tool result.
     */
    toolCallId: string;

    /**
     * Name of the tool that is being called.
     */
    toolName: NAME;

    /**
     * Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
     */
    args: ARGS;
}

/**
 * Typed tool result that is returned by generateText and streamText. 
 * It contains the tool call ID, the tool name, the tool arguments, and the tool result.
 */
export interface CoreToolResult<NAME extends string, ARGS, RESULT> {
    /**
     * ID of the tool call. This ID is used to match the tool call with the tool result.
     */
    toolCallId: string;

    /**
     * Name of the tool that was called.
     */
    toolName: NAME;

    /**
     * Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
     */
    args: ARGS;

    /**
     * Result of the tool call. This is the result of the tool's execution.
     */
    result: RESULT;
}
