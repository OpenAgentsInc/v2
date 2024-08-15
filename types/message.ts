import { Message as SDKMessage } from 'ai';
import { Attachment } from './attachment';
import { ToolInvocation } from './tool-invocation';
import { Id } from '../convex/_generated/dataModel';

export interface Message extends Partial<SDKMessage> {
    /**
     * A unique identifier for the message.
     */
    _id: Id<"messages">;

    /**
     * The timestamp of the message.
     */
    _creationTime: number;

    /**
     * Text content of the message.
     */
    content: string;

    /**
     * `function` and `tool` roles are deprecated.
     */
    role: 'system' | 'user' | 'assistant' | 'data';

    /**
     * Additional attachments to be sent along with the message.
     */
    experimental_attachments?: Attachment[];

    /**
     * Tool invocations (that can be tool calls or tool results, depending on whether or not the invocation has finished)
     * that the assistant made as part of this message.
     */
    tool_invocations?: Record<string, any>;

    /**
     * The reason why the message generation finished.
     */
    finish_reason?: string;

    /**
     * Total number of tokens used for this message.
     */
    total_tokens?: number;

    /**
     * Number of tokens used for the prompt.
     */
    prompt_tokens?: number;

    /**
     * Number of tokens used for the completion.
     */
    completion_tokens?: number;

    /**
     * The ID of the model used for this message.
     */
    model_id?: string;

    /**
     * The cost of generating this message in cents.
     */
    cost_in_cents?: number;

    /**
     * The ID of the thread this message belongs to.
     */
    thread_id: Id<"threads">;

    /**
     * The Clerk user ID associated with this message.
     */
    clerk_user_id: string;
}