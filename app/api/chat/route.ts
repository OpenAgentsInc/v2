import { convertToCoreMessages, streamText } from "ai"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { getSystemPrompt } from "@/lib/systemPrompt"
import { getToolContext, getTools } from "@/tools"
import { auth } from "@clerk/nextjs/server"

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.json();
  console.log("request body:", JSON.stringify(body, null, 2));
  const threadId = body.threadId as Id<"threads">;

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

  // Check user balance is > 0, but skip for GPT-4o Mini
  if (toolContext.model.modelId !== 'gpt-4o-mini') {
    try {
      const userBalance = await convex.query(api.users.getUserBalance.getUserBalance, { clerk_user_id: userId });
      if (userBalance <= 0) {
        console.error("Insufficient credits for user:", userId);
        return new Response('Insufficient credits', { status: 403 });
      }
    } catch (error) {
      console.error('Error checking user balance:', error);
      return new Response('Error checking user balance', { status: 500 });
    }
  }

  console.log("BEFORE CONVERSION:", JSON.stringify(body.messages, null, 2));
  const messages = convertToCoreMessages(body.messages);
  console.log("AFTER CONVERSION:", JSON.stringify(messages, null, 2));
  console.log("Converting messages to core messages");
  const result = await streamText({
    messages,
    model: toolContext.model,
    system: getSystemPrompt(toolContext),
    tools,
  });

  // console.log("Stream text result:", JSON.stringify(result, null, 2));

  // // Save message and update user balance
  // try {
  //   const usage = {
  //     promptTokens: result.usage?.promptTokens || 0,
  //     completionTokens: result.usage?.completionTokens || 0,
  //     totalTokens: result.usage?.totalTokens || 0,
  //   };
  //   console.log("Usage:", JSON.stringify(usage));

  //   console.log("Calling saveMessageAndUpdateBalance with:", JSON.stringify({
  //     clerk_user_id: userId,
  //     model_id: toolContext.model,
  //     usage,
  //   }));

  //   const { cost_in_cents, newBalance } = await convex.mutation(api.users.saveMessageAndUpdateBalance, {
  //     clerk_user_id: userId,
  //     model_id: toolContext.model,
  //     usage,
  //   });

  //   console.log(`Message cost: ${cost_in_cents} cents. New balance: ${newBalance}`);
  // } catch (error) {
  //   console.error('Error saving message and updating user balance:', error);
  //   // console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  // }

  return result.toAIStreamResponse();
}
