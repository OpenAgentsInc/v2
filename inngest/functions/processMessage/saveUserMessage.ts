import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function saveUserMessage(threadId: string, userId: string, content: string) {
  return await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
    thread_id: threadId as any, // Type assertion to avoid the error
    clerk_user_id: userId,
    content: content,
    role: 'user',
    model_id: 'default', // You might want to make this configurable
  });
}