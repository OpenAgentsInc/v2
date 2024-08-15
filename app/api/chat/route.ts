import { convertToCoreMessages, streamText } from 'ai';
import { getSystemPrompt } from '@/lib/systemPrompt';
import { getTools, getToolContext } from '@/tools';
import { auth } from '@clerk/nextjs/server';
import { Id } from '@/convex/_generated/dataModel';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.json();
  const threadId = body.threadId as Id<"threads">;

  console.log("POST request received with body:", JSON.stringify(body));

  if (!threadId) {
    console.error("Invalid threadId");
    return new Response('Invalid threadId', { status: 400 });
  }

  const toolContext = await getToolContext(body);
  const tools = getTools(toolContext, body.tools);
  const { userId } = auth();
  if (!userId) {
    console.error("Unauthorized: No userId found");
    return new Response('Unauthorized', { status: 401 });
  }

  console.log("User authenticated with userId:", userId);

  // Check user balance is > 0, but skip for GPT-4o Mini
  if (toolContext.model !== 'gpt-4o-mini') {
    try {
      const userBalance = await convex.query(api.users.getUserBalance, { clerk_user_id: userId });
      console.log("User balance:", userBalance);
      if (userBalance <= 0) {
        console.error("Insufficient credits for user:", userId);
        return new Response('Insufficient credits', { status: 403 });
      }
    } catch (error) {
      console.error('Error checking user balance:', error);
      return new Response('Error checking user balance', { status: 500 });
    }
  }

  const messages = convertToCoreMessages(body.messages);
  console.log("Converting messages to core messages");
  const result = await streamText({
    messages,
    model: toolContext.model,
    system: getSystemPrompt(toolContext),
    tools,
  });

  console.log("Stream text result:", JSON.stringify(result, null, 2));

  return result.toAIStreamResponse();
}