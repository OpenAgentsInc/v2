import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { githubDeleteFile } from '@/lib/githubUtils';
import { ToolContext } from '@/types';

const params = z.object({
    path: z.string().describe("The path of the file to delete"),
    owner: z.string().optional().describe("The owner of the repository"),
    repo: z.string().optional().describe("The name of the repository"),
    branch: z.string().optional().describe("The branch to delete the file from"),
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    error?: string;
    summary: string;
    details: string;
};

export const deleteFileTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    description: "Delete file at path",
    parameters: params,
    execute: async ({ path, owner, repo, branch }: Params): Promise<Result> => {
        const repoOwner = owner || context.repo?.owner;
        const repoName = repo || context.repo?.name;
        const repoBranch = branch || context.repo?.branch || 'main';

        if (!repoOwner || !repoName) {
            return {
                success: false,
                error: "Missing repository information",
                summary: "Failed to delete file due to missing repository information",
                details: "The repository owner or name is missing. Please provide both in the request or ensure they are set in the context."
            };
        }

        if (!context.gitHubToken) {
            return {
                success: false,
                error: "Missing GitHub token",
                summary: "Failed to delete file due to missing GitHub token",
                details: "The GitHub token is missing. Please ensure it is provided in the context."
            };
        }

        try {
            await githubDeleteFile({
                path,
                token: context.gitHubToken,
                repoOwner,
                repoName,
                branch: repoBranch
            });

            return {
                success: true,
                summary: `Deleted ${path} in ${repoOwner}/${repoName} on branch ${repoBranch}`,
                details: `File ${path} in ${repoOwner}/${repoName} on branch ${repoBranch} has been successfully deleted.`
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(errorMessage);
            return {
                success: false,
                error: errorMessage,
                summary: `Failed to delete ${path} in ${repoOwner}/${repoName} on branch ${repoBranch}`,
                details: `Failed to delete file at ${path} in ${repoOwner}/${repoName} on branch ${repoBranch}. Error: ${errorMessage}`
            };
        }
    },
});