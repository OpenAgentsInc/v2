import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { githubReadFile } from '@/lib/githubUtils';
import { ToolContext } from '@/types';

const params = z.object({
    path: z.string().describe("The path of the file to view"),
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    content?: string;
    error?: string;
    summary: string;
    details: string;
};

export const viewFileTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    description: "View file contents at path",
    parameters: params,
    execute: async ({ path }: Params): Promise<Result> => {
        if (!context.repo || !context.user) {
            return {
                success: false,
                error: "Missing repository or user information",
                summary: "Failed to view file due to missing context",
                details: "The tool context is missing required repository or user information."
            };
        }

        try {
            const content = await githubReadFile({
                path,
                token: context.gitHubToken ?? process.env.GITHUB_TOKEN ?? '', // TODO
                repoOwner: context.repo.owner,
                repoName: context.repo.name,
                branch: context.repo.branch
            });

            return {
                success: true,
                content: content,
                summary: `Viewed ${path} on branch ${context.repo.branch || 'main'}`,
                details: `File contents of ${path} on branch ${context.repo.branch || 'main'} have been retrieved:\n\n${content}`
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(errorMessage);
            return {
                success: false,
                error: errorMessage,
                summary: `Failed to view ${path} on branch ${context.repo.branch || 'main'}`,
                details: `Failed to retrieve file contents at ${path} on branch ${context.repo.branch || 'main'}. Error: ${errorMessage}`
            };
        }
    },
});
