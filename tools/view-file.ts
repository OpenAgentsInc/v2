import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { githubReadFile } from '@/lib/githubUtils';

const params = z.object({
    path: z.string().describe("The path of the file to view"),
    token: z.string().describe("GitHub access token"),
    repoContext: z.object({
        owner: z.string(),
        name: z.string(),
        branch: z.string().optional()
    }).describe("Repository context")
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    content?: string;
    error?: string;
    summary: string;
    details: string;
};

export const viewFileTool: CoreTool<typeof params, Result> = tool({
    description: "View file contents at path",
    parameters: params,
    execute: async ({ path, token, repoContext }: Params): Promise<Result> => {
        try {
            const content = await githubReadFile({
                path,
                token,
                repoOwner: repoContext.owner,
                repoName: repoContext.name,
                branch: repoContext.branch
            });

            return {
                success: true,
                content: content,
                summary: `Viewed ${path} on branch ${repoContext.branch || 'main'}`,
                details: `File contents of ${path} on branch ${repoContext.branch || 'main'} have been retrieved:\n\n${content}`
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: errorMessage,
                summary: `Failed to view ${path} on branch ${repoContext.branch || 'main'}`,
                details: `Failed to retrieve file contents at ${path} on branch ${repoContext.branch || 'main'}. Error: ${errorMessage}`
            };
        }
    },
});