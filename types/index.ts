// ... (keep any existing imports and type definitions)

export type OnChunkResult = {
  chunk: { 
    type: "text-delta"; 
    textDelta: string; 
  } | { 
    type: "tool-call-streaming-start"; 
    toolCallId: string; 
    toolName: string; 
  } | { 
    type: "tool-call-delta"; 
    toolCallId: string; 
    toolName: string; 
    argsTextDelta: string; 
  } | { 
    type: "tool-call"; 
    toolCallId: string; 
    toolName: string; 
    args: Record<string, any>; 
  }
};

// ... (keep any existing type definitions after this)