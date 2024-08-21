"use server"

import { authenticateUser } from "./authenticateUser"
import { triggerInngestEvent } from "./triggerInngestEvent"

interface SendMessageProps {
  text: string
  threadId: string
}

export async function sendMessage({ text, threadId }: SendMessageProps) {
  const user = await authenticateUser()

  await triggerInngestEvent({
    threadId,
    userId: user.id,
    content: text,
  })

  return { success: true }
}