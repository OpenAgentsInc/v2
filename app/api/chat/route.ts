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

// New function to ensure messages are in the correct order
function ensureValidMessageOrder(messages: any[]) {
  const validMessages = [];
  let lastRole = null;

  for (const message of messages) {
    if (message.role === 'user' || message.role === 'assistant') {
      if (message.role !== lastRole) {
        validMessages.push(message);
        lastRole = message.role;
      } else if (message.role === 'user') {
        // If we have consecutive user messages, combine them
        const lastMessage = validMessages[validMessages.length - 1];
        lastMessage.content += "\n\n" + message.content;
      }
    } else if (message.role === 'tool') {
      // Always include tool messages
      validMessages.push(message);
    }
  }

  // Ensure the conversation ends with a user message
  if (lastRole === 'assistant') {
    validMessages.pop();
  }

  return validMessages;
}

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
  const validMessages = ensureValidMessageOrder(body.messages);
  const messages = convertToCoreMessages(validMessages);
  console.log("AFTER CONVERSION:", JSON.stringify(messages, null, 2));
  console.log("Converting messages to core messages");
  const result = await streamText({
    messages,
    model: toolContext.model,
    system: getSystemPrompt(toolContext),
    tools,
  });

  return result.toAIStreamResponse();
}