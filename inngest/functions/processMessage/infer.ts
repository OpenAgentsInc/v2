import { generateText } from "ai"
import { getSystemPrompt } from "@/lib/systemPrompt"
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
    maxToolRoundtrips: 50, // todo: make this a passed-in prop
    messages,
    model: toolContext.model,
    system: getSystemPrompt(toolContext),
    tools
  });
  return result
}
