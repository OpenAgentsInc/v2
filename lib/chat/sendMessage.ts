"use server"

import { inngest } from "@/inngest/client"
import { currentUser } from "@clerk/nextjs/server"

interface SendMessageProps {
  text: string
}

export async function sendMessage({ text }: SendMessageProps) {
  const user = currentUser()

  if (!user) {
    return
  }

  await inngest.send({
    name: "test/hello.world",
    data: { text }
  });
}
