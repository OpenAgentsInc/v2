import { z } from 'zod';
import { tool, CoreTool } from 'ai';
import { Octokit } from '@octokit/rest';
import { ToolContext } from '@/types';

const params = z.object({
    path: z.string().describe('The path where the new file should be created'),
    content: z.string().describe('The content of the new file'),
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    content: string;
    summary: string;
    details: string;
};

export const createFileTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    description: 'Creates a new file at the given path with the provided content',
    parameters: params,
    execute: async ({ path, content }: Params): Promise<Result> => {
        if (!context.repo || !context.gitHubToken) {
            return {
                success: false,
                content: 'Missing repository information or GitHub token',
                summary: 'Failed to create file due to missing context',
                details: 'The tool context is missing required repository information or GitHub token.'
            };
        }

        const octokit = new Octokit({ auth: context.gitHubToken });
        const branch = context.repo.branch || 'main';
        console.log(`Creating file on branch: ${branch}`);

        try {
            await octokit.repos.createOrUpdateFileContents({
                owner: context.repo.owner,
                repo: context.repo.name,
                path,
                message: `Create file ${path}`,
                content: Buffer.from(content).toString('base64'),
                branch: branch,
            });

            return {
                success: true,
                content: `File ${path} created successfully.`,
                summary: `Created file at ${path}`,
                details: `File ${path} was created in the repository ${context.repo.owner}/${context.repo.name} on branch ${branch}.`,
            };
        } catch (error) {
            console.error('Error creating file:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                content: `Failed to create file ${path}.`,
                summary: `Error creating file at ${path}`,
                details: `Error: ${errorMessage}`,
            };
        }
    },
});
