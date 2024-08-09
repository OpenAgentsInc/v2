// When streamText is done, we:
//   - Save the message and usage to database
//   - Deduct credits from the user's balance
import { CompletionTokenUsage, FinishReason } from 'ai';
import { saveChatMessage } from "@/db/actions";
import { Message } from '@/lib/types';

export async function onFinish(result: ThreadOnFinishResult) {
    console.log('onFinish called with threadId:', result.threadId, 'and clerkUserId:', result.clerkUserId);

    // Save the assistant's message to the thread
    const message: Message = {
        role: 'assistant',
        content: result.text,
        toolInvocations: result.toolCalls ? {
            toolCalls: result.toolCalls,
            toolResults: result.toolResults
        } : undefined
    };

    const savedMessage = await saveChatMessage(result.threadId.toString(), result.clerkUserId, message);

    if (savedMessage) {
        console.log('Assistant message saved:', savedMessage);
    } else {
        console.error('Failed to save assistant message');
    }

    // TODO: Implement logic to deduct credits from the user's balance
    // This would typically involve updating the user's credit balance in the database
    // based on the usage information in result.usage
    console.log('Token usage:', result.usage);

    // You might want to call a function like:
    // await deductUserCredits(result.clerkUserId, result.usage);
}

export interface OnFinishResult {
    /**
     * The reason why the generation finished.
     */
    finishReason: FinishReason;

    /**
     * The token usage of the generated response.
     */
    usage: CompletionTokenUsage;

    /**
     * The full text that has been generated.
     */
    text: string;

    /**
     * The tool calls that have been executed.
     */
    toolCalls?: any; // ToToolCall<TOOLS>[];

    /**
     * The tool results that have been generated.
     */
    toolResults?: any; // ToToolResult<TOOLS>[];
}

export interface ThreadOnFinishResult extends OnFinishResult {
    /**
     * The ID of the thread associated with this result.
     */
    threadId: number;

    /**
     * The Clerk user ID associated with this result.
     */
    clerkUserId: string;
}
