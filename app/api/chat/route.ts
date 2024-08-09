import { convertToCoreMessages, streamText } from 'ai';
import { getSystemPrompt } from '@/lib/systemPrompt';
import { getTools, getToolContext } from '@/tools';
import { onFinish } from './onFinish';
import { auth } from '@clerk/nextjs/server';
import { createNewThread, saveChatMessage } from '@/db/actions';
import { Message } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const getOrCreateThread = async (threadId: string | undefined, clerkUserId: string, firstMessage: Message) => {
    if (threadId) {
        return { id: parseInt(threadId, 10) };
    }
    const result = await createNewThread(clerkUserId, firstMessage);
    return { id: result.threadId };
}

export async function POST(req: Request) {
    const body = await req.json();
    const toolContext = await getToolContext(body);
    const tools = getTools(toolContext, body.tools);

    const { userId } = auth();
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const messages = convertToCoreMessages(body.messages);
    const userMessage = messages[messages.length - 1];

    if (userMessage.role !== 'user') {
        return new Response('Last message must be from user', { status: 400 });
    }

    const thread = await getOrCreateThread(body.threadId, userId, userMessage);

    // Save the user's message
    await saveChatMessage(thread.id.toString(), userId, userMessage);

    const result = await streamText({
        messages,
        model: toolContext.model,
        system: getSystemPrompt(toolContext),
        tools,
        onFinish: (finishResult) => onFinish({ ...finishResult, threadId: thread.id, clerkUserId: userId }),
    });

    return result.toAIStreamResponse();
}
