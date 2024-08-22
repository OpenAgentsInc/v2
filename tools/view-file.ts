import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { githubReadFile } from '@/lib/githubUtils';
import { ToolContext } from '@/types';

const params = z.object({
    path: z.string().describe("The path of the file to view"),
    repoUrl: z.string().optional().describe("Optional URL of the GitHub repository to view the file from"),
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
    description: "View file contents at path, optionally from a specified repository",
    parameters: params,
    execute: async ({ path, repoUrl }: Params): Promise<Result> => {
        if (!context.repo || !context.user) {
            return {
                success: false,
                error: "Missing repository or user information",
                summary: "Failed to view file due to missing context",
                details: "The tool context is missing required repository or user information."
            };
        }

        let repoOwner = context.repo.owner;
        let repoName = context.repo.name;
        let branch = context.repo.branch;

        if (repoUrl) {
            const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/);
            if (match) {
                [, repoOwner, repoName, branch = 'main'] = match;
            } else {
                return {
                    success: false,
                    error: "Invalid repository URL",
                    summary: "Failed to parse repository URL",
                    details: "The provided repository URL is not in the expected format: https://github.com/owner/repo"
                };
            }
        }

        try {
            const content = await githubReadFile({
                path,
                token: context.gitHubToken ?? process.env.GITHUB_TOKEN ?? '', // TODO
                repoOwner,
                repoName,
                branch
            });

            return {
                success: true,
                content: content,
                summary: `Viewed ${path} on branch ${branch} of ${repoOwner}/${repoName}`,
                details: `File contents of ${path} on branch ${branch} of ${repoOwner}/${repoName} have been retrieved:\n\n${content}`
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(errorMessage);
            return {
                success: false,
                error: errorMessage,
                summary: `Failed to view ${path} on branch ${branch} of ${repoOwner}/${repoName}`,
                details: `Failed to retrieve file contents at ${path} on branch ${branch} of ${repoOwner}/${repoName}. Error: ${errorMessage}`
            };
        }
    },
});