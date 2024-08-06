import { z } from 'zod';
import { CoreTool } from 'ai';
import { Octokit } from '@octokit/rest';

const RepoContextSchema = z.object({
    owner: z.string(),
    name: z.string(),
    branch: z.string().optional(),
});

const CreateFileParamsSchema = z.object({
    path: z.string().describe('The path where the new file should be created'),
    content: z.string().describe('The content of the new file'),
    token: z.string().describe('GitHub access token'),
    repoContext: RepoContextSchema,
});

type CreateFileParams = z.infer<typeof CreateFileParamsSchema>;

interface CreateFileResult {
    success: boolean;
    content: string;
    summary: string;
    details: string;
}

export const createFileTool: CoreTool<typeof CreateFileParamsSchema, CreateFileResult> = {
    description: 'Creates a new file at the given path with the provided content',
    parameters: CreateFileParamsSchema,
    execute: async ({ path, content, token, repoContext }: CreateFileParams): Promise<CreateFileResult> => {
        const octokit = new Octokit({ auth: token });
        const branch = repoContext.branch || 'main';
        console.log(`Creating file on branch: ${branch}`);

        try {
            const response = await octokit.repos.createOrUpdateFileContents({
                owner: repoContext.owner,
                repo: repoContext.name,
                path,
                message: `Create file ${path}`,
                content: Buffer.from(content).toString('base64'),
                branch: branch,
            });

            return {
                success: true,
                content: `File ${path} created successfully.`,
                summary: `Created file at ${path}`,
                details: `File ${path} was created in the repository ${repoContext.owner}/${repoContext.name} on branch ${branch}.`,
            };
        } catch (error) {
            console.error('Error creating file:', error);
            return {
                success: false,
                content: `Failed to create file ${path}.`,
                summary: `Error creating file at ${path}`,
                details: `Error: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};