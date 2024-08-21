import { inngest } from "../client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const processMessage = inngest.createFunction(
  { id: "process-message" },
  { event: "chat/process.message" },
  async ({ event, step }) => {
    const { threadId, userId, content } = event.data;

    // Save the initial user message to Convex
    const savedMessage = await step.run("save-user-message", async () => {
      return await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
        thread_id: threadId,
        clerk_user_id: userId,
        content: content,
        role: 'user',
        model_id: 'default', // You might want to make this configurable
      });
    });

    if (!savedMessage) {
      throw new Error("Failed to save user message");
    }

    // Process the message (this is where you'd integrate with your AI model)
    const processedContent = await step.run("process-content", async () => {
      // Placeholder for AI processing
      return `Processed: ${content}`;
    });

    // Save the processed message back to Convex
    const savedAIMessage = await step.run("save-processed-message", async () => {
      return await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
        thread_id: threadId,
        clerk_user_id: userId,
        content: processedContent,
        role: 'assistant',
        model_id: 'default', // You might want to make this configurable
      });
    });

    return { userMessageId: savedMessage.id, aiMessageId: savedAIMessage.id, threadId, userId, processedContent };
  },
);