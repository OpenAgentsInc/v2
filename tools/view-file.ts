import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { githubReadFile } from '@/lib/githubUtils';
import { ToolContext } from '@/types';

const params = z.object({
    path: z.string().describe("The path of the file to view"),
    owner: z.string().optional().describe("The owner of the repository"),
    repo: z.string().optional().describe("The name of the repository"),
    branch: z.string().optional().describe("The branch to view the file from"),
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
    execute: async ({ path, owner, repo, branch }: Params): Promise<Result> => {
        if (!context.repo || !context.user) {
            return {
                success: false,
                error: "Missing repository or user information",
                summary: "Failed to view file due to missing context",
                details: "The tool context is missing required repository or user information."
            };
        }

        const repoOwner = owner || context.repo.owner;
        const repoName = repo || context.repo.name;
        const repoBranch = branch || context.repo.branch || 'main';

        try {
            const content = await githubReadFile({
                path,
                token: context.gitHubToken ?? process.env.GITHUB_TOKEN ?? '', // TODO
                repoOwner,
                repoName,
                branch: repoBranch
            });

            return {
                success: true,
                content: content,
                summary: `Viewed ${path} in ${repoOwner}/${repoName} on branch ${repoBranch}`,
                details: `File contents of ${path} in ${repoOwner}/${repoName} on branch ${repoBranch} have been retrieved:\n\n${content}`
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(errorMessage);
            return {
                success: false,
                error: errorMessage,
                summary: `Failed to view ${path} in ${repoOwner}/${repoName} on branch ${repoBranch}`,
                details: `Failed to retrieve file contents at ${path} in ${repoOwner}/${repoName} on branch ${repoBranch}. Error: ${errorMessage}`
            };
        }
    },
});