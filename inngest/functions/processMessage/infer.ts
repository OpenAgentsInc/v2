import { generateText } from "ai"
import { getToolContext, getTools, ToolName } from "@/tools"
import { anthropic } from "@ai-sdk/anthropic"

interface InferProps {
  messages: any[]
  modelId: string
  tools: ToolName[]
}

export async function infer({ messages, modelId, tools: bodyTools }: InferProps) {
  const toolContext = await getToolContext({ modelId });
  const tools = getTools(toolContext, bodyTools);
  const result = await generateText({
    messages,
    model: anthropic(modelId),
    system: "You are a helpful assistant.",
    tools
  });
  return {
    response: result.text
  }
}
