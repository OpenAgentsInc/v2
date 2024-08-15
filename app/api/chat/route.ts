import { convertToCoreMessages, streamText } from 'ai';
import { getSystemPrompt } from '@/lib/systemPrompt';
import { getTools, getToolContext } from '@/tools';
import { auth } from '@clerk/nextjs/server';
import { Id } from '@/convex/_generated/dataModel';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { calculateMessageCost } from '@/convex/utils';
import { Model, CompletionTokenUsage } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.json();
  const threadId = body.threadId as Id<"threads">;

  if (!threadId) {
    return new Response('Invalid threadId', { status: 400 });
  }

  const toolContext = await getToolContext(body);
  const tools = getTools(toolContext, body.tools);
  const { userId } = auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check user balance is > 0, but skip for GPT-4o Mini
  if (body.model !== 'gpt-4o-mini') {
    try {
      const userBalance = await convex.query(api.users.getUserBalance, { clerk_user_id: userId });
      if (userBalance <= 0) {
        return new Response('Insufficient credits', { status: 403 });
      }
    } catch (error) {
      console.error('Error checking user balance:', error);
      return new Response('Error checking user balance', { status: 500 });
    }
  }

  const messages = convertToCoreMessages(body.messages);
  const result = await streamText({
    messages,
    model: toolContext.model,
    system: getSystemPrompt(toolContext),
    tools,
  });

  // Calculate the cost based on the model and usage
  const usage: CompletionTokenUsage = {
    promptTokens: result.usage?.promptTokens || 0,
    completionTokens: result.usage?.completionTokens || 0,
    totalTokens: result.usage?.totalTokens || 0,
  };
  const model: Model = {
    id: toolContext.model,
    providerCentsPerMillionInputTokens: 0, // You need to set these values based on your pricing
    providerCentsPerMillionOutputTokens: 0, // You need to set these values based on your pricing
  };
  const cost_in_cents = calculateMessageCost(model, usage);

  // Update user balance after processing the message
  try {
    await convex.mutation(api.users.updateUserBalance, { clerk_user_id: userId, cost_in_cents });
  } catch (error) {
    console.error('Error updating user balance:', error);
  }

  return result.toAIStreamResponse();
}