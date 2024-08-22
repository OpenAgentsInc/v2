import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { ProcessMessageData } from "./"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function saveUserMessage({ content, threadId, userId }: ProcessMessageData) {
  return await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
    clerk_user_id: userId,
    content: content,
    role: 'user',
    thread_id: threadId as Id<"threads">,
  });
}
