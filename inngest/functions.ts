import { inngest } from "./client"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { event, body: "Hello, World!" };
  },
);

export const processMessage = inngest.createFunction(
  { id: "process-message" },
  { event: "chat/process.message" },
  async ({ event, step }) => {
    const { messageId, threadId, userId } = event.data;

    // Fetch the message from Convex
    const message = await step.run("fetch-message", async () => {
      return await convex.query(api.messages.getChatById.getChatById, { id: messageId });
    });

    if (!message) {
      throw new Error("Message not found");
    }

    // Process the message (this is where you'd integrate with your AI model)
    const processedContent = await step.run("process-content", async () => {
      // Placeholder for AI processing
      return `Processed: ${message.content}`;
    });

    // Save the processed message back to Convex
    await step.run("save-processed-message", async () => {
      await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
        thread_id: threadId,
        clerk_user_id: userId,
        content: processedContent,
        role: 'assistant',
        model_id: 'default', // You might want to make this configurable
      });
    });

    return { messageId, threadId, userId, processedContent };
  },
);