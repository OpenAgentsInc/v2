import { convertToCoreMessages, streamText } from 'ai';
import { getSystemPrompt } from '@/lib/systemPrompt';
import { getTools, getToolContext } from '@/tools';
import { onFinish } from './onFinish';
import { auth } from '@clerk/nextjs/server';
import { Message } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
    const body = await req.json();
    const threadId = Number(body.threadId);

    if (isNaN(threadId)) {
        return new Response('Invalid threadId', { status: 400 });
    }

    const toolContext = await getToolContext(body);
    const tools = getTools(toolContext, body.tools);
    const { userId } = auth();
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const messages = convertToCoreMessages(body.messages);
    const userMessage = messages[messages.length - 1] as Message;
    const result = await streamText({
        messages,
        model: toolContext.model,
        system: getSystemPrompt(toolContext),
        tools,
        onFinish: (finishResult) => {
            const assistantMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: finishResult.text,
            };
            onFinish({
                ...finishResult,
                threadId,
                clerkUserId: userId,
                userMessage,
                assistantMessage,
            });
        },
    });
    return result.toAIStreamResponse();
}