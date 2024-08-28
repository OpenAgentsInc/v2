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

function ensureValidMessageOrder(messages: any[]) {
  const validatedMessages = [];
  let lastRole = null;

  for (const message of messages) {
    if (message.role === 'tool') {
      // Always include tool messages
      validatedMessages.push(message);
      // After a tool message, we need an assistant message
      if (lastRole !== 'assistant') {
        validatedMessages.push({ role: 'assistant', content: 'Continuing the conversation based on the tool result.' });
      }
    } else if (message.role === lastRole) {
      // Combine consecutive messages with the same role
      const lastMessage = validatedMessages[validatedMessages.length - 1];
      if (typeof lastMessage.content === 'string' && typeof message.content === 'string') {
        lastMessage.content += '\n' + message.content;
      } else if (Array.isArray(lastMessage.content) && Array.isArray(message.content)) {
        lastMessage.content = lastMessage.content.concat(message.content);
      } else {
        validatedMessages.push(message);
      }
    } else {
      if (message.role === 'user' && lastRole === 'user') {
        // If we have consecutive user messages, add an assistant message in between
        validatedMessages.push({ role: 'assistant', content: 'I understand. Please continue.' });
      }
      validatedMessages.push(message);
    }
    lastRole = message.role;
  }

  // Ensure the conversation ends with a user message
  if (validatedMessages[validatedMessages.length - 1].role !== 'user') {
    validatedMessages.push({ role: 'user', content: 'Continue' });
  }

  // Ensure the conversation starts with a user message
  if (validatedMessages[0].role !== 'user') {
    validatedMessages.unshift({ role: 'user', content: 'Start the conversation' });
  }

  return validatedMessages;
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
  const validatedMessages = ensureValidMessageOrder(body.messages);
  const messages = convertToCoreMessages(validatedMessages);
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