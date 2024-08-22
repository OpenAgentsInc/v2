import { inngest } from "@/inngest/client"
import { processContent } from "./processContent"
import { saveProcessedMessage } from "./saveProcessedMessage"
import { saveUserMessage } from "./saveUserMessage"

export const processMessage = inngest.createFunction(
  { id: "process-message", name: "Process Message" },
  { event: "chat/process.message" },
  async ({ event, step }) => {
    const { threadId, content, userId } = event.data;

    // Step 1: Save user message
    const userMessage = await step.run("Save User Message", async () => {
      return await saveUserMessage(threadId, userId, content);
    });

    // Step 2: Process content
    const processedContent = await step.run("Process Content", async () => {
      return await processContent(content);
    });

    // Step 3: Save processed message
    const assistantMessage = await step.run("Save Processed Message", async () => {
      return await saveProcessedMessage(userId, threadId, processedContent, "assistant");
    });

    return { userMessage, assistantMessage };
  }
);
