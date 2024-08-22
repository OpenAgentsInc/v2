"use server"

import { authenticateUser } from "./authenticateUser"
import { triggerInngestEvent } from "./triggerInngestEvent"

interface SendMessageProps {
  modelId?: string
  text: string
  threadId: string
}

export async function sendMessage({ modelId = 'anthropic.claude-3-5-sonnet-20240620-v1:0', text, threadId }: SendMessageProps) {
  const user = await authenticateUser()

  await triggerInngestEvent({
    content: text,
    modelId,
    threadId,
    userId: user.id,
  })

  return { success: true }
}
