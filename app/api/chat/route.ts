import { convertToCoreMessages, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { getSystemPrompt } from '@/lib/systemPrompt'
import { getTools, getToolContext } from '@/tools'

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
    const body = await req.json();
    const toolContext = await getToolContext(body)

    const result = await streamText({
        messages: convertToCoreMessages(body.messages),
        model: openai('gpt-4o'),
        system: getSystemPrompt(toolContext),
        tools: getTools(toolContext)
    });

    return result.toAIStreamResponse();
}

