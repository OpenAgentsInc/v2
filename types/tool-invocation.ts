import { ToolInvocation as SDKToolInvocation } from 'ai';
import { ToolCall } from './tool-call';
import { ToolResult } from './tool-result';

/**
 * Tool invocations are either tool calls or tool results. For each assistant tool call,
 * there is one tool invocation. While the call is in progress, the invocation is a tool call.
 * Once the call is complete, the invocation is a tool result.
 * 
 * This type extends the SDKToolInvocation to ensure compatibility with the 'ai' package.
 */
export type ToolInvocation = SDKToolInvocation & (
    | ({ state: 'partial-call' } & ToolCall<string, any>)
    | ({ state: 'call' } & ToolCall<string, any>)
    | ({ state: 'result' } & ToolResult<string, any, any>)
);
