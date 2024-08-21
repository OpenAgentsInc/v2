import { prisma } from "@/lib/prisma";
import { Message } from "@prisma/client";

export async function saveProcessedMessage(
  chatId: string,
  content: string,
  role: "assistant" | "function",
  name?: string
): Promise<Message> {
  return await prisma.message.create({
    data: {
      chatId,
      content,
      role,
      name,
    },
  });
}