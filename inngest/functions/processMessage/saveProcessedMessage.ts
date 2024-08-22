import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function saveProcessedMessage(
  userId: string,
  threadId: string,
  content: string,
  role: "assistant" | "function",
  name?: string
) {
  return await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
    clerk_user_id: userId,
    thread_id: threadId as Id<"threads">,
    content,
    role,
    // model_id: 'default', // You might want to make this configurable
  });
}
