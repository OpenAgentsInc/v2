'use server'
import { sql } from '@vercel/postgres'
import { Message, ToolInvocation } from '@/types'

export async function fetchThreadMessages(threadId: number): Promise<Message[]> {
    console.log('Fetching messages for thread:', threadId)
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return []
    }
    try {
        const { rows } = await sql`
        SELECT id, role, content, created_at as "createdAt", tool_invocations as "toolInvocations"
        FROM messages
        WHERE thread_id = ${threadId}
        ORDER BY created_at ASC, id ASC
        `;
        return rows.map(msg => {
            let content: string = '';
            let toolInvocations: ToolInvocation[] | undefined;
            let createdAt: Date;

            if (typeof msg.content === 'string') {
                console.log('Message content is string:', msg.content)
                try {
                    const parsedContent = JSON.parse(msg.content);
                    if (Array.isArray(parsedContent) && parsedContent[0]?.type === 'tool-result') {
                        // This is a tool message, extract toolInvocations
                        toolInvocations = parsedContent.map(item => ({
                            toolCallId: item.toolCallId,
                            toolName: item.toolName,
                            args: item.args,
                            result: item.result,
                            state: 'result'
                        }));
                        content = ''; // Set content to empty string as it's now in toolInvocations
                        // Use the timestamp from the first tool result if available
                        createdAt = new Date(parsedContent[0].result?.timestamp || msg.createdAt);
                    } else {
                        // It's JSON, but not a tool result, so stringify it
                        content = JSON.stringify(parsedContent);
                        createdAt = new Date(msg.createdAt);
                    }
                } catch {
                    // If parsing fails, it's already a string
                    console.log("failed - already a string", msg.content)
                    content = msg.content;
                    createdAt = new Date(msg.createdAt);
                }
            } else if (Array.isArray(msg.content) && msg.content[0]?.type === 'tool-result') {
                // Direct array of tool results
                toolInvocations = msg.content.map(item => ({
                    toolCallId: item.toolCallId,
                    toolName: item.toolName,
                    args: item.args,
                    result: item.result,
                    state: 'result'
                }));
                content = ''; // Set content to empty string as it's now in toolInvocations
                // Use the timestamp from the first tool result if available
                createdAt = new Date(msg.content[0].result?.timestamp || msg.createdAt);
            } else {
                content = String(msg.content); // Fallback to string conversion
                createdAt = new Date(msg.createdAt);
            }

            // If toolInvocations is still undefined, check msg.toolInvocations
            if (!toolInvocations && msg.toolInvocations) {
                console.log('Checking toolInvocations:', msg.toolInvocations)
                if (Array.isArray(msg.toolInvocations)) {
                    toolInvocations = msg.toolInvocations;
                } else if (typeof msg.toolInvocations === 'string') {
                    try {
                        const parsedToolInvocations = JSON.parse(msg.toolInvocations);
                        if (Array.isArray(parsedToolInvocations)) {
                            toolInvocations = parsedToolInvocations;
                        }
                    } catch (error) {
                        console.error(`Error parsing toolInvocations string for message ${msg.id}:`, error);
                    }
                } else {
                    console.error(`Unexpected toolInvocations format for message ${msg.id}:`, msg.toolInvocations);
                }
            }

            return {
                id: msg.id.toString(),
                content: content,
                role: msg.role as Message['role'],
                createdAt: createdAt,
                toolInvocations: toolInvocations
            };
        });
    } catch (error) {
        console.error('Error in fetchThreadMessages:', error);
        throw error;
    }
}
