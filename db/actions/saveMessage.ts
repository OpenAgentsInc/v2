'use server'
import { sql } from '@vercel/postgres'
import { Message, OnFinishOptions } from '@/types'

export async function saveMessage(threadId: number, clerkUserId: string, message: Message, options: OnFinishOptions) {
    try {
        console.log("IN DB saveMessage WITH MESSAGE AND OPtions:", message, options);
        const contentString = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
        const toolInvocationsString = message.toolInvocations ? JSON.stringify(message.toolInvocations) : null;

        const { rows } = await sql`
        INSERT INTO messages (thread_id, clerk_user_id, role, content, tool_invocations, finish_reason, total_tokens, prompt_tokens, completion_tokens)
        VALUES (${threadId}, ${clerkUserId}, ${message.role}, ${contentString}, ${toolInvocationsString}::jsonb, ${options.finishReason}, ${options.usage.totalTokens}, ${options.usage.promptTokens}, ${options.usage.completionTokens})
        RETURNING id, created_at as "createdAt", tool_invocations as "toolInvocations"
        `;

        const savedMessage = {
            ...message,
            id: rows[0].id,
            createdAt: rows[0].createdAt,
            toolInvocations: rows[0].toolInvocations || undefined
        };

        return savedMessage;
    } catch (error) {
        console.error('Error in saveMessage:', error);
        throw error;
    }
}
