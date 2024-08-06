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
    const toolContext = await getToolContext(body)

    const result = await streamText({
        model: openai('gpt-4o'),
        messages: convertToCoreMessages(body.messages),
        prompt: getSystemPrompt(toolContext),
        tools: getTools(toolContext)
    });

    return result.toAIStreamResponse();
}

const getToolContext = async (body: any) => {
    console.log('Request body:', JSON.stringify(body));
    const { repoOwner, repoName, repoBranch } = body

    const repo: Repo = {
        owner: repoOwner,
        name: repoName,
        branch: repoBranch
    }

    const user = await currentUser()

    return { repo, user }
}
