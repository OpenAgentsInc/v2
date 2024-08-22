import { inngest } from "@/inngest/client"
import { gatherContext } from "./gatherContext"
import { infer } from "./infer"
import { saveProcessedMessage } from "./saveProcessedMessage"
import { saveUserMessage } from "./saveUserMessage"

export interface ProcessMessageData {
  threadId: string
  content: string
  userId: string
}

export const processMessage = inngest.createFunction(
  { id: "process-message", name: "Process Message" },
  { event: "chat/process.message" },
  async ({ event, step }) => {
    const { threadId, content, userId } = event.data as ProcessMessageData;

    // Save user message to Convex database
    await step.run("Save User Message", async () => {
      return await saveUserMessage({ content, threadId, userId });
    });

    // Collect relevant message history and tools
    const { messages, tools } = await step.run("Gather Context", async () => {
      return await gatherContext({ content, threadId, userId })
    });

    // Send message, context, and tools to LLM
    const { response } = await step.run("LLM Inference", async () => {
      return await infer({ messages, tools })
    });

    // Save processed message
    const assistantMessage = await step.run("Save Processed Message", async () => {
      return await saveProcessedMessage(userId, threadId, response, "assistant");
    });

    return { assistantMessage };
  }
);
