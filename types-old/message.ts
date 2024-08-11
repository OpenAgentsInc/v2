import { type JSONValue } from './misc'
import { type ToolInvocation } from './tools'

/**
 * Our simplified version of AI SDK UI Messages. 
 * They are used in the client and to communicate between the frontend and the API routes.
 */
export interface Message {
    /**
     * A unique identifier for the message.
     */
    id: string;

    /**
     * The timestamp of the message.
     */
    createdAt?: Date;

    /**
     * Text content of the message.
     */
    content: string;

    /**
     * `function` and `tool` roles are deprecated.
     */
    role:
    | 'system'
    | 'user'
    | 'assistant'
    | 'data'

    data?: JSONValue;

    /**
     * Additional message-specific information added on the server via StreamData
     */
    annotations?: JSONValue[] | undefined;

    /**
     * Tool invocations (that can be tool calls or tool results, depending on whether or not the invocation has finished)
     * that the assistant made as part of this message.
     */
    toolInvocations?: Array<ToolInvocation>;
}
