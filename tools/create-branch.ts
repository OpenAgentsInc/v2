import { z } from 'zod';
import { tool, CoreTool } from 'ai';
import { Octokit } from '@octokit/rest';
import { ToolContext } from '@/types';

const params = z.object({
    name: z.string().describe('The name of the new branch'),
    baseBranch: z.string().optional().describe('The name of the branch to base the new branch on. If not provided, the default branch will be used.'),
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    content: string;
    summary: string;
    details: string;
};

export const createBranchTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    description: 'Creates a new branch in the repository',
    parameters: params,
    execute: async ({ name, baseBranch }: Params): Promise<Result> => {
        if (!context.repo || !context.gitHubToken) {
            return {
                success: false,
                content: 'Missing repository information or GitHub token',
                summary: 'Failed to create branch due to missing context',
                details: 'The tool context is missing required repository information or GitHub token.'
            };
        }

        const octokit = new Octokit({ auth: context.gitHubToken });

        try {
            // Get the SHA of the base branch (or default branch if not specified)
            const { data: refData } = await octokit.git.getRef({
                owner: context.repo.owner,
                repo: context.repo.name,
                ref: `heads/${baseBranch || context.repo.branch || 'main'}`,
            });

            // Create the new branch
            await octokit.git.createRef({
                owner: context.repo.owner,
                repo: context.repo.name,
                ref: `refs/heads/${name}`,
                sha: refData.object.sha,
            });

            return {
                success: true,
                content: `Branch '${name}' created successfully.`,
                summary: `Created branch '${name}'`,
                details: `Branch '${name}' was created in the repository ${context.repo.owner}/${context.repo.name} based on ${baseBranch || context.repo.branch || 'main'}.`,
            };
        } catch (error) {
            console.error('Error creating branch:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                content: `Failed to create branch '${name}'.`,
                summary: `Error creating branch '${name}'`,
                details: `Error: ${errorMessage}`,
            };
        }
    },
});