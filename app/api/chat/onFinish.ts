// When streamText is done, we:
//   - Save the message and usage to database
//   - Deduct credits from the user's balance

import { CompletionTokenUsage, FinishReason } from 'ai';

export function onFinish(result: OnFinishResult) {
    console.log('onFinish:', result);
}

export interface OnFinishResult {
    /**
     * The reason why the generation finished.
     */
    finishReason: FinishReason;

    /**
     * The token usage of the generated response.
     */
    usage: CompletionTokenUsage;

    /**
     * The full text that has been generated.
     */
    text: string;

    /**
     * The tool calls that have been executed.
     */
    toolCalls?: any; // ToToolCall<TOOLS>[];

    /**
     * The tool results that have been generated.
     */
    toolResults?: any; // ToToolResult<TOOLS>[];
}
