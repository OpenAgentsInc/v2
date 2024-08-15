import { Message as SDKMessage } from 'ai';
import { Attachment } from './attachment';
import { ToolInvocation } from './tool-invocation';

export interface Message extends Partial<SDKMessage> {
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
    | 'data';

    /**
     * Additional attachments to be sent along with the message.
     */
    experimental_attachments?: Attachment[];

    /**
     * Tool invocations (that can be tool calls or tool results, depending on whether or not the invocation has finished)
     * that the assistant made as part of this message.
     */
    toolInvocations?: Array<ToolInvocation>;
}