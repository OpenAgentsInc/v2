import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { githubListContents } from '@/lib/githubUtils';

const params = z.object({
    path: z.string().describe("The path to view the hierarchy"),
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
    contents?: string;
    error?: string;
    summary: string;
    details: string;
};

export const viewHierarchyTool: CoreTool<typeof params, Result> = tool({
    description: "View file/folder hierarchy at path (one level deep)",
    parameters: params,
    execute: async ({ path, token, repoContext }: Params): Promise<Result> => {
        console.log("Executing viewHierarchyTool with path:", path, "token:", token, "repoContext:", repoContext);
        try {
            const items = await githubListContents({
                path,
                token,
                repoOwner: repoContext.owner,
                repoName: repoContext.name,
                branch: repoContext.branch
            });

            const result = items.map(item => `- ${item}`).join('\n');
            console.log(result)

            return {
                success: true,
                contents: result,
                summary: `Viewed hierarchy at ${path} on branch ${repoContext.branch || 'main'}`,
                details: `Project structure at ${path} on branch ${repoContext.branch || 'main'} (one level deep):\n${result}`
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: errorMessage,
                summary: `Failed to view hierarchy at ${path} on branch ${repoContext.branch || 'main'}`,
                details: `Failed to retrieve project structure at ${path} on branch ${repoContext.branch || 'main'}. Error: ${errorMessage}`
            };
        }
    },
});
