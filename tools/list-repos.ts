import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { githubListUserRepos } from '@/lib/githubUtils';

const params = z.object({
    token: z.string().describe("GitHub access token"),
    repoContext: z.object({
        owner: z.string(),
        name: z.string(),
        branch: z.string().optional()
    }).describe("Repository context"),
    perPage: z.number().optional().describe("Number of repositories to fetch (max 100)"),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe("Sorting criteria"),
    direction: z.enum(['asc', 'desc']).optional().describe("Sorting direction"),
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    repos?: any[];
    error?: string;
    summary: string;
    details: string;
};

export const listReposTool: CoreTool<typeof params, Result> = tool({
    name: 'list_repos',
    description: 'Lists the most recent repositories for the authenticated user',
    parameters: params,
    execute: async ({ token, perPage, sort, direction }: Params): Promise<Result> => {
        try {
            const repos = await githubListUserRepos({ token, perPage, sort, direction });
            return {
                success: true,
                repos,
                summary: 'Successfully listed user repositories',
                details: `Retrieved ${repos.length} most recent repositories for the authenticated user.`
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: errorMessage,
                summary: 'Failed to list user repositories',
                details: `An error occurred while trying to list repositories: ${errorMessage}`
            };
        }
    },
});
