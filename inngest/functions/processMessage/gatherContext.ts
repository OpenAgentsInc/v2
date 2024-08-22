import { ToolName } from "@/tools"

interface GatherContextProps {
  content: string
  threadId: string
  userId: string
}

export async function gatherContext({ content, threadId, userId }: GatherContextProps) {
  // Gather the thread's message history

  // Truncate/summarize as needed

  // Select tools. Hardcoding fine for now

  return {
    messages: [],
    tools: [
      "view_file",
      "view_hierarchy",
      "create_file",
      "rewrite_file"
    ] as ToolName[]
  }
}
