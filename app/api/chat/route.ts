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

// Function to calculate cost based on the model and message length
function calculateCost(model: string, messageLength: number): number {
  // This is a placeholder implementation. Replace with actual cost calculation logic.
  const baseCost = model === 'gpt-4' ? 0.03 : 0.002; // Cost per token
  const estimatedTokens = messageLength / 4; // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(baseCost * estimatedTokens * 100); // Convert to cents and round up
}

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

  // Calculate the cost based on the model and message length
  const lastMessage = messages[messages.length - 1];
  const cost_in_cents = calculateCost(toolContext.model, lastMessage.content.length);

  // Update user balance after processing the message
  try {
    await convex.mutation(api.users.updateUserBalance, { clerk_user_id: userId, cost_in_cents });
  } catch (error) {
    console.error('Error updating user balance:', error);
  }

  return result.toAIStreamResponse();
}