export type OnChunkResult = {
  chunk:
  | {
    type: "tool-result";
    toolCallId: string;
    toolName: string;
    args: Record<string, any>;
    result: any;
  }
  | {
    type: "text-delta";
    textDelta: string;
  }
  | {
    type: "tool-call-streaming-start";
    toolCallId: string;
    toolName: string;
  }
  | {
    type: "tool-call-delta";
    toolCallId: string;
    toolName: string;
    argsTextDelta: string;
  }
  | ({
    type: "tool-call";
    toolCallId: string;
    toolName: string;
    args: Record<string, any>;
  } & { content: string });
};
