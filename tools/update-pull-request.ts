import { z } from 'zod';
import { tool, CoreTool } from 'ai';
import { Octokit } from '@octokit/rest';
import { ToolContext } from '@/types';

const params = z.object({
  pull_number: z.number().describe('The number of the pull request to update'),
  title: z.string().optional().describe('The new title of the pull request'),
  body: z.string().optional().describe('The new body of the pull request'),
});

type Params = z.infer<typeof params>;

type Result = {
  success: boolean;
  content: string;
  summary: string;
  details: string;
};

export const updatePullRequestTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  description: 'Updates an existing pull request with a new title and/or body',
  parameters: params,
  execute: async ({ pull_number, title, body }: Params): Promise<Result> => {
    if (!context.repo || !context.gitHubToken) {
      return {
        success: false,
        content: 'Missing repository information or GitHub token',
        summary: 'Failed to update pull request due to missing context',
        details: 'The tool context is missing required repository information or GitHub token.'
      };
    }

    const octokit = new Octokit({ auth: context.gitHubToken });

    try {
      const { data } = await octokit.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.name,
        pull_number,
        title,
        body,
      });

      return {
        success: true,
        content: `Pull request #${pull_number} updated successfully.`,
        summary: `Updated pull request #${pull_number}`,
        details: `Pull request #${pull_number} was updated in the repository ${context.repo.owner}/${context.repo.name}. ${title ? `New title: "${title}". ` : ''}${body ? 'Body was also updated.' : ''}`,
      };
    } catch (error) {
      console.error('Error updating pull request:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        content: 'Failed to update pull request.',
        summary: 'Error updating pull request',
        details: `Error: ${errorMessage}`,
      };
    }
  },
});