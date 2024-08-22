import { ToolName } from "@/tools"
import { ProcessMessageData } from "./"

export async function gatherContext({ content, threadId, userId }: Omit<ProcessMessageData, "modelId">) {
  // Gather the thread's message history

  // Truncate/summarize as needed

  // Select tools

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
