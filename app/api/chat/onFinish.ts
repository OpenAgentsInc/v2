// When streamText is done, we:
//   - Save the message and usage to database
//   - Deduct credits from the user's balance
import { CompletionTokenUsage, FinishReason } from 'ai';
import { saveChatMessage, createNewThread } from "@/db/actions";
import { Message } from '@/lib/types';

export async function onFinish(result: ThreadOnFinishResult) {
    console.log('onFinish called with threadId:', result.threadId, 'and clerkUserId:', result.clerkUserId);

    let threadId = result.threadId;

    // If no threadId, create a new thread
    if (!threadId) {
        console.log('Creating new thread');
        const newThread = await createNewThread(result.clerkUserId, result.userMessage);
        threadId = newThread.threadId.toString();
        console.log('New thread created:', threadId);
    } else {
        // Save the user's message if it's an existing thread
        console.log('Saving user message to existing thread:', threadId);
        await saveChatMessage(threadId, result.clerkUserId, result.userMessage);
    }

    // Save the assistant's message
    const assistantMessage: Message = {
        role: 'assistant',
        content: result.text,
        toolInvocations: result.toolCalls ? {
            toolCalls: result.toolCalls,
            toolResults: result.toolResults
        } : undefined
    };

    const savedAssistantMessage = await saveChatMessage(threadId, result.clerkUserId, assistantMessage);

    if (savedAssistantMessage) {
        console.log('Assistant message saved:', savedAssistantMessage);
    } else {
        console.error('Failed to save assistant message');
    }

    // TODO: Implement logic to deduct credits from the user's balance
    console.log('Token usage:', result.usage);
    // await deductUserCredits(result.clerkUserId, result.usage);
}

export interface OnFinishResult {
    finishReason: FinishReason;
    usage: CompletionTokenUsage;
    text: string;
    toolCalls?: any;
    toolResults?: any;
}

export interface ThreadOnFinishResult extends OnFinishResult {
    threadId?: string;
    clerkUserId: string;
    userMessage: Message;
}
