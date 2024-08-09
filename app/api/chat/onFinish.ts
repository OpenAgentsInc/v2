import { CompletionTokenUsage, FinishReason } from 'ai';
import { saveChatMessage } from "@/db/actions";
import { Message } from '@/lib/types';

export async function onFinish(result: ThreadOnFinishResult) {
    console.log('onFinish called with threadId:', result.threadId, 'and clerkUserId:', result.clerkUserId);

    // Save the user's message
    await saveChatMessage(result.threadId, result.clerkUserId, result.userMessage);

    // Save the assistant's message
    const assistantMessage: Message = {
        id: Date.now().toString(), // Add a unique id
        role: 'assistant',
        content: result.text,
        toolInvocations: result.toolCalls ? result.toolCalls : undefined
    };

    const savedAssistantMessage = await saveChatMessage(result.threadId, result.clerkUserId, assistantMessage);

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
    toolCalls?: any[];
    toolResults?: any[];
}

export interface ThreadOnFinishResult extends OnFinishResult {
    threadId: number;
    clerkUserId: string;
    userMessage: Message;
}