import { z } from 'zod';
import { Schema } from './schema';
import { Repo } from "./repo";
import { User } from "@clerk/nextjs/server";
import { ValueOf } from '@/lib/util/value-of';

type Parameters = z.ZodTypeAny | Schema<any>;

export type inferParameters<PARAMETERS extends Parameters> =
    PARAMETERS extends Schema<any>
    ? PARAMETERS['_type']
    : PARAMETERS extends z.ZodTypeAny
    ? z.infer<PARAMETERS>
    : never;

export interface CoreTool<PARAMETERS extends Parameters = any, RESULT = any> {
    description?: string;
    parameters: PARAMETERS;
    execute?: (args: inferParameters<PARAMETERS>) => PromiseLike<RESULT>;
}

export function tool<PARAMETERS extends Parameters, RESULT>(
    tool: CoreTool<PARAMETERS, RESULT> & {
        execute: (args: inferParameters<PARAMETERS>) => PromiseLike<RESULT>;
    },
): CoreTool<PARAMETERS, RESULT> & {
    execute: (args: inferParameters<PARAMETERS>) => PromiseLike<RESULT>;
};
export function tool<PARAMETERS extends Parameters, RESULT>(
    tool: CoreTool<PARAMETERS, RESULT> & {
        execute?: undefined;
    },
): CoreTool<PARAMETERS, RESULT> & {
    execute: undefined;
};
export function tool<PARAMETERS extends Parameters, RESULT = any>(
    tool: CoreTool<PARAMETERS, RESULT>,
): CoreTool<PARAMETERS, RESULT> {
    return tool;
}

export interface ToolContext {
    user: User | null;
    repo: Repo | null;
    gitHubToken: string | undefined;
    firecrawlToken: string | undefined;
    greptileToken: string | undefined;
    model: any; // LanguageModelV1(?)
}

export interface ToolCall<NAME extends string, ARGS> {
    toolCallId: string;
    toolName: NAME;
    args: ARGS;
}

export interface ToolResult<NAME extends string, ARGS, RESULT> {
    toolCallId: string;
    toolName: NAME;
    args: ARGS;
    result: RESULT;
}

export type ToolInvocation =
    | ({ state: 'partial-call' } & ToolCall<string, any>)
    | ({ state: 'call' } & ToolCall<string, any>)
    | ({ state: 'result' } & ToolResult<string, any, any>);

export type ToToolCall<TOOLS extends Record<string, CoreTool>> = ValueOf<{
    [NAME in keyof TOOLS]: {
        type: 'tool-call';
        toolCallId: string;
        toolName: NAME & string;
        args: inferParameters<TOOLS[NAME]['parameters']>;
    };
}>;

export type ToToolCallArray<TOOLS extends Record<string, CoreTool>> = Array<
    ToToolCall<TOOLS>
>;
