import { ToolName } from "@/tools"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface GatherContextProps {
  content: string
  threadId: string
  userId: string
}

export async function gatherContext({ content, threadId, userId }: GatherContextProps) {
  // Gather the thread's message history
  const messages = await convex.query(api.threads.getThreadMessages, { threadId: threadId as Id<"threads"> })

  // Convert Convex messages to the format expected by the LLM
  const formattedMessages = messages.map(message => ({
    role: message.role as "user" | "assistant",
    content: message.content
  }))

  // Add the new user message
  formattedMessages.push({
    role: "user",
    content
  })

  // Truncate/summarize as needed
  // For now, we'll just take the last 10 messages if there are more than 10
  const truncatedMessages = formattedMessages.slice(-10)

  // Select tools. Hardcoding fine for now
  const tools: ToolName[] = [
    "view_file",
    "view_hierarchy",
    "create_file",
    "rewrite_file"
  ]

  return {
    messages: truncatedMessages,
    tools
  }
}