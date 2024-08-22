import { generateText } from "ai"
import { getToolContext, getTools, ToolName } from "@/tools"
import { Repo } from "@/types"

interface InferProps {
  messages: any[]
  modelId: string
  repo: Repo | null
  tools: ToolName[]
}

export async function infer({ messages, modelId, repo, tools: bodyTools }: InferProps) {
  const toolContext = await getToolContext({ modelId, repo });
  const tools = getTools(toolContext, bodyTools);
  const result = await generateText({
    messages,
    model: toolContext.model,
    system: "You are a helpful assistant.",
    tools
  });
  return {
    response: result.text
  }
}
