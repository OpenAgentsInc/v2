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

// Updated function to ensure messages are in the correct order
function ensureValidMessageOrder(messages: any[]) {
  const validMessages = [];
  let lastRole = null;
  let pendingToolCall = null;

  for (const message of messages) {
    if (message.role === 'user' || message.role === 'assistant') {
      if (pendingToolCall) {
        // If there's a pending tool call, add a dummy result
        validMessages.push({
          role: 'tool',
          content: [{ type: 'tool-result', result: { success: false, content: 'Tool call interrupted' } }]
        });
        pendingToolCall = null;
      }

      if (message.role !== lastRole) {
        validMessages.push(message);
        lastRole = message.role;
      } else if (message.role === 'user') {
        // If we have consecutive user messages, combine them
        const lastMessage = validMessages[validMessages.length - 1];
        lastMessage.content += "\n\n" + message.content;
      }
    } else if (message.role === 'assistant' && message.toolInvocations) {
      // Handle tool calls
      validMessages.push(message);
      pendingToolCall = message;
      lastRole = 'assistant';
    } else if (message.role === 'tool') {
      // Add tool result and clear pending tool call
      validMessages.push(message);
      pendingToolCall = null;
      lastRole = 'tool';
    }
  }

  // If there's still a pending tool call at the end, add a dummy result
  if (pendingToolCall) {
    validMessages.push({
      role: 'tool',
      content: [{ type: 'tool-result', result: { success: false, content: 'Tool call interrupted' } }]
    });
  }

  // Ensure the conversation ends with a user message
  if (lastRole !== 'user') {
    validMessages.push({ role: 'user', content: 'Continue' });
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

  try {
    const result = await streamText({
      messages,
      model: toolContext.model,
      system: getSystemPrompt(toolContext),
      tools,
      keepLastMessageOnError: true,
      sendExtraMessageFields: true,
      experimental_prepareRequestBody: (options) => {
        // Ensure the last message is from the user
        if (options.messages.length > 0 && options.messages[options.messages.length - 1].role !== 'user') {
          options.messages.push({ role: 'user', content: 'Continue' });
        }
        return options;
      },
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error("Error in chat stream:", error);
    return new Response('Error in chat stream', { status: 500 });
  }
}