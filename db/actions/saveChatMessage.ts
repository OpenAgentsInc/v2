'use server'

import { sql } from '@vercel/postgres'
import { Message, OnFinishOptions } from '@/types'

async function getLastMessage(threadId: number) {
    try {
        const { rows } = await sql`
            SELECT content
            FROM messages
            WHERE thread_id = ${threadId}
            ORDER BY created_at DESC
            LIMIT 1
        `
        return rows[0] || null
    } catch (error) {
        console.error('Error in getLastMessage:', error)
        return null
    }
}

export async function saveChatMessage(
    threadId: number,
    clerkUserId: string,
    message: Message,
    options?: OnFinishOptions
) {
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return null
    }

    const lastMessage = await getLastMessage(threadId)
    if (lastMessage && lastMessage.content === message.content) {
        console.log("Duplicate message, not saving:", message.content)
        return null
    }

    try {
        console.log("IN DB saveChatMessage WITH MESSAGE AND OPTIONS:", message, options);
        const contentString = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
        const toolInvocationsString = message.toolInvocations ? JSON.stringify(message.toolInvocations) : null;

        let queryString = `
        INSERT INTO messages (thread_id, clerk_user_id, role, content, tool_invocations`;
        let values = [threadId, clerkUserId, message.role, contentString, toolInvocationsString];
        let placeholders = ['$1', '$2', '$3', '$4', '$5::jsonb'];

        if (options) {
            queryString += `, finish_reason, total_tokens, prompt_tokens, completion_tokens, model_id, cost_in_cents`;
            values.push(
                options.finishReason,
                options.usage?.totalTokens,
                options.usage?.promptTokens,
                options.usage?.completionTokens,
                options.modelId || null,
                options.costInCents || null
            );
            placeholders.push('$6', '$7', '$8', '$9', '$10', '$11');
        }

        queryString += `)
        VALUES (${placeholders.join(', ')})
        RETURNING id, created_at as "createdAt", tool_invocations as "toolInvocations"`;

        const { rows } = await sql.query(queryString, values);

        const savedMessage = {
            ...message,
            id: rows[0].id,
            createdAt: rows[0].createdAt,
            toolInvocations: rows[0].toolInvocations || undefined
        };

        console.log('Message saved:', savedMessage)
        return savedMessage;
    } catch (error) {
        console.error('Error in saveChatMessage:', error);
        throw error;
    }
}
