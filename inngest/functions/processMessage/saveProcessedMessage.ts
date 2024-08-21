import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function saveProcessedMessage(
  threadId: string,
  content: string,
  role: "assistant" | "function",
  name?: string
) {
  return await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
    thread_id: threadId,
    content,
    role,
    name,
    model_id: 'default', // You might want to make this configurable
  });
}