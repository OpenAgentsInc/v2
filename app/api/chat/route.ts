import { convertToCoreMessages, streamText } from 'ai';
import { getSystemPrompt } from '@/lib/systemPrompt';
import { getTools, getToolContext } from '@/tools';
import { onFinish } from './onFinish';
import { auth } from '@clerk/nextjs/server';
import { Message } from '@/lib/types';
import { fetchThreadMessages } from '@/db/actions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
    const body = await req.json();
    const threadId = Number(body.threadId);
    const page = Number(body.page) || 1;
    const limit = Number(body.limit) || 10;

    if (isNaN(threadId)) {
        return new Response('Invalid threadId', { status: 400 });
    }

    const toolContext = await getToolContext(body);
    const tools = getTools(toolContext, body.tools);
    const { userId } = auth();
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Fetch paginated messages
    const { messages: dbMessages, hasMore } = await fetchThreadMessages(threadId, page, limit);

    const messages = convertToCoreMessages(dbMessages);
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

    // Add pagination information to the response
    const responseHeaders = new Headers(result.headers);
    responseHeaders.set('X-Has-More', hasMore.toString());
    responseHeaders.set('X-Page', page.toString());
    responseHeaders.set('X-Limit', limit.toString());

    return new Response(result.body, {
        headers: responseHeaders,
        status: result.status,
        statusText: result.statusText,
    });
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const threadId = Number(url.searchParams.get('threadId'));
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    if (isNaN(threadId)) {
        return new Response('Invalid threadId', { status: 400 });
    }

    const { userId } = auth();
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { messages, hasMore } = await fetchThreadMessages(threadId, page, limit);
        return new Response(JSON.stringify({ messages, hasMore, page, limit }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return new Response('Error fetching messages', { status: 500 });
    }
}