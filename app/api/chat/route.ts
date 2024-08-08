import { convertToCoreMessages, streamText } from 'ai';
import { getSystemPrompt } from '@/lib/systemPrompt';
import { getTools, getToolContext } from '@/tools';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
    const body = await req.json();
    const toolContext = await getToolContext(body);
    const tools = getTools(toolContext, body.tools);

    const result = await streamText({
        messages: convertToCoreMessages(body.messages),
        model: toolContext.model,
        system: getSystemPrompt(toolContext),
        tools
    });

    return result.toAIStreamResponse();
}
