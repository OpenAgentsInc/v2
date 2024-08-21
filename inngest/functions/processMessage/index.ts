import { inngest } from "@/inngest/client";
import { saveUserMessage } from "./saveUserMessage";
import { processContent } from "./processContent";
import { saveProcessedMessage } from "./saveProcessedMessage";

export const processMessage = inngest.createFunction(
  { name: "Process Message" },
  { event: "chat/message.sent" },
  async ({ event, step }) => {
    const { chatId, content, role } = event.data;

    // Step 1: Save user message
    const userMessage = await step.run("Save User Message", async () => {
      return await saveUserMessage(chatId, content);
    });

    // Step 2: Process content
    const processedContent = await step.run("Process Content", async () => {
      return await processContent(content);
    });

    // Step 3: Save processed message
    const assistantMessage = await step.run("Save Processed Message", async () => {
      return await saveProcessedMessage(chatId, processedContent, "assistant");
    });

    return { userMessage, assistantMessage };
  }
);