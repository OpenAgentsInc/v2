import { convertToCoreMessages, streamText } from 'ai';
import { getSystemPrompt } from '@/lib/systemPrompt';
import { getTools, getToolContext } from '@/tools';
import { onFinish } from './onFinish';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const getThread = async (threadId?: number) => {
    console.log('Placeholder getThread:', threadId);
    return { id: 1, metadata: {} };
}

export async function POST(req: Request) {
    const body = await req.json();
    const toolContext = await getToolContext(body);
    const tools = getTools(toolContext, body.tools);
    const thread = await getThread(body.threadId)

    const result = await streamText({
        messages: convertToCoreMessages(body.messages),
        model: toolContext.model,
        system: getSystemPrompt(toolContext),
        tools,
        onFinish: (finishResult) => onFinish({ ...finishResult, threadId: thread.id }),
    });

    return result.toAIStreamResponse();
}
