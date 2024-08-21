"use server"

import { inngest } from "@/inngest/client"
import { currentUser } from "@clerk/nextjs/server"

interface SendMessageProps {
  text: string
  threadId: string
}

export async function sendMessage({ text, threadId }: SendMessageProps) {
  const user = await currentUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Trigger Inngest event for message processing
  await inngest.send({
    name: "chat/process.message",
    data: {
      threadId: threadId,
      userId: user.id,
      content: text,
    }
  });

  return { success: true }
}