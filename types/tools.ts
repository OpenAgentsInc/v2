import { Repo } from "./repo";
import { User } from "@clerk/nextjs/server";

/**
 * Info passed to generate tools.
 */
export interface ToolContext {
    /**
     * The user who is running the tools.
     */
    user: User | null;
    /**
     * The repository that the tools are running on.
     */
    repo: Repo | null;
    /**
     * The GitHub token for the user.
     * This token is used to authenticate with the GitHub API.
     */
    gitHubToken: string | undefined;
}

/**
 * Typed tool call that is returned by generateText and streamText. 
 * It contains the tool call ID, the tool name, and the tool arguments. 
 */
export interface ToolCall<NAME extends string, ARGS> {
    /**
     * ID of the tool call. This ID is used to match the tool call with the tool result.
     */
    toolCallId: string;

    /**
     * Name of the tool that is being called.
     */
    toolName: NAME;

    /**
     * Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
     */
    args: ARGS;
}

/**
 * Typed tool result that is returned by generateText and streamText. 
 * It contains the tool call ID, the tool name, the tool arguments, and the tool result.
 */
export interface ToolResult<NAME extends string, ARGS, RESULT> {
    /**
     * ID of the tool call. This ID is used to match the tool call with the tool result.
     */
    toolCallId: string;

    /**
     * Name of the tool that was called.
     */
    toolName: NAME;

    /**
     * Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
     */
    args: ARGS;

    /**
     * Result of the tool call. This is the result of the tool's execution.
     */
    result: RESULT;
}

/**
 * Tool invocations are either tool calls or tool results. For each assistant tool call,
 * there is one tool invocation. While the call is in progress, the invocation is a tool call.
 * Once the call is complete, the invocation is a tool result.
 */
export type ToolInvocation =
    | ({ state: 'partial-call' } & ToolCall<string, any>)
    | ({ state: 'call' } & ToolCall<string, any>)
    | ({ state: 'result' } & ToolResult<string, any, any>);
