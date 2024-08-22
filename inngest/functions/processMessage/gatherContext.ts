import { ProcessMessageData } from "./"

export async function gatherContext({ content, threadId, userId }: Omit<ProcessMessageData, "modelId">) {
  // Gather the thread's message history

  // Condense as needed

  // Select tools

  return {
    messages: [],
    tools: []
  }
}
