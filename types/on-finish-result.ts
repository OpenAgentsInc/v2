import { CompletionTokenUsage } from "./token-usage"
import { ToolCall } from "./tool-call"
import { ToolResult } from "./tool-result"

export interface OnFinishResult {
  // The reason the model finished generating the text.
  finishReason: "stop" | "length" | "content-filter" | "tool-calls" | "error" | "other" | "unknown";
  // The token usage of the generated text.
  usage: CompletionTokenUsage;
  // The full text that has been generated.
  text: string
  // The tool calls that have been executed.
  toolCalls?: any //ToolCall<any, any>[]
  // The tool results that have been generated.
  toolResults?: ToolResult<any, any, any>[]
}
