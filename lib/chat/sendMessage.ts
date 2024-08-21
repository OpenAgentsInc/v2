"use server"

import { inngest } from "@/inngest/client"
import { currentUser } from "@clerk/nextjs/server"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

interface SendMessageProps {
  text: string
  threadId: string
}

export async function sendMessage({ text, threadId }: SendMessageProps) {
  const user = await currentUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Save the message to Convex
  const savedMessage = await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
    thread_id: threadId,
    clerk_user_id: user.id,
    content: text,
    role: 'user',
    model_id: 'default', // You might want to make this configurable
  })

  // Trigger Inngest event for message processing
  await inngest.send({
    name: "chat/process.message",
    data: { 
      messageId: savedMessage.id,
      threadId: threadId,
      userId: user.id,
    }
  });

  return savedMessage
}