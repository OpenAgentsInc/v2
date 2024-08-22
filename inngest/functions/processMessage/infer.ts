import { streamText } from "ai"
import { getSystemPrompt } from "@/lib/systemPrompt"
import { getToolContext, getTools, ToolName } from "@/tools"
import { Repo } from "@/types"

interface InferProps {
  githubToken?: string
  messages: any[]
  modelId: string
  repo: Repo | null
  tools: ToolName[]
}

export async function infer({ githubToken, messages, modelId, repo, tools: bodyTools }: InferProps) {
  const toolContext = await getToolContext({ githubToken, modelId, repo });
  const tools = getTools(toolContext, bodyTools);
  const { textStream, text, finishReason, usage } = await streamText({
    maxToolRoundtrips: 50, // todo: make this a passed-in prop
    messages,
    model: toolContext.model,
    system: getSystemPrompt(toolContext),
    tools,
    onChunk: (chunk) => {
      // Console log each chunk
      console.log("Chunk received:", chunk);
    }
  });

  // Collect the full response
  let fullResponse = '';
  for await (const chunk of textStream) {
    fullResponse += chunk;
  }

  return {
    result: fullResponse,
    finishReason,
    usage
  };
}