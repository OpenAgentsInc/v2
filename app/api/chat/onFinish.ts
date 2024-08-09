// When streamText is done, we:
//   - Save the message and usage to database
//   - Deduct credits from the user's balance
import { CompletionTokenUsage, FinishReason } from 'ai';
// import { saveMessage } from '@/lib/thread'; // Assume we'll create this function

const saveMessage = async (message: any) => {
    console.log('Mock saving message:', message);
}

export async function onFinish(result: ThreadOnFinishResult) {
    // console.log('onFinish:', result);

    // Save the assistant's message to the thread
    await saveMessage({
        threadId: result.threadId,
        role: 'assistant',
        content: result.text,
        toolCalls: result.toolCalls,
        toolResults: result.toolResults,
    });

    // Here you would also implement logic to deduct credits from the user's balance
    // based on the usage information in result.usage
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

export interface ThreadOnFinishResult extends OnFinishResult {
    /**
     * The ID of the thread associated with this result.
     */
    threadId: number;
}
