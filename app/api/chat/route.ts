import { getSystemPrompt } from 'lib/systemPrompt'
import { openai } from '@ai-sdk/openai'
import { convertToCoreMessages, streamText } from 'ai'
import { currentUser } from '@clerk/nextjs/server'
import { Repo } from '@/lib/types'
import { getTools } from '@/tools'

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    const { messages, repoOwner, repoName, repoBranch } = body

    const repo: Repo = {
        owner: repoOwner,
        name: repoName,
        branch: repoBranch
    }

    const user = await currentUser()

    const result = await streamText({
        model: openai('gpt-4o'),
        messages: convertToCoreMessages(messages),
        prompt: getSystemPrompt(user),
        tools: getTools(user, repo)
    });

    return result.toAIStreamResponse();
}
