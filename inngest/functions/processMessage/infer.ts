import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

interface InferProps {
  messages: any[]
  modelId: string
  tools: any[]
}

export async function infer({ messages, modelId, tools }: InferProps) {
  const result = await generateText({
    messages,
    model: anthropic(modelId),
    system: "You are a helpful assistant.",
    // tools: [],
  });
  return {
    response: result.text
  }
}
