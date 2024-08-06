import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { githubListContents } from '@/lib/githubUtils';
import { ToolContext } from '@/types';

const params = z.object({
    path: z.string().describe("The path to view the hierarchy"),
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    contents?: string;
    error?: string;
    summary: string;
    details: string;
};

export const viewHierarchyTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    description: "View file/folder hierarchy at path (one level deep)",
    parameters: params,
    execute: async ({ path }: Params): Promise<Result> => {
        if (!context.repo || !context.user) {
            return {
                success: false,
                error: "Missing repository or user information",
                summary: "Failed to view hierarchy due to missing context",
                details: "The tool context is missing required repository or user information."
            };
        }

        try {
            const items = await githubListContents({
                path,
                token: context.gitHubToken ?? process.env.GITHUB_TOKEN ?? '',
                repoOwner: context.repo.owner,
                repoName: context.repo.name,
                branch: context.repo.branch
            });

            const result = items.map(item => `- ${item}`).join('\n');

            return {
                success: true,
                contents: result,
                summary: `Viewed hierarchy at ${path} on branch ${context.repo.branch || 'main'}`,
                details: `Project structure at ${path} on branch ${context.repo.branch || 'main'} (one level deep):\n${result}`
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(errorMessage);
            return {
                success: false,
                error: errorMessage,
                summary: `Failed to view hierarchy at ${path} on branch ${context.repo.branch || 'main'}`,
                details: `Failed to retrieve project structure at ${path} on branch ${context.repo.branch || 'main'}. Error: ${errorMessage}`
            };
        }
    },
});
