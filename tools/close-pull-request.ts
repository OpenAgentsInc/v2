import { z } from 'zod';
import { tool, CoreTool } from 'ai';
import { Octokit } from '@octokit/rest';
import { ToolContext } from '@/types';

const params = z.object({
  pull_number: z.number().describe('The number of the pull request to close'),
});

type Params = z.infer<typeof params>;

type Result = {
  success: boolean;
  content: string;
  summary: string;
  details: string;
};

export const closePullRequestTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  description: 'Closes an open pull request',
  parameters: params,
  execute: async ({ pull_number }: Params): Promise<Result> => {
    if (!context.repo || !context.gitHubToken) {
      return {
        success: false,
        content: 'Missing repository information or GitHub token',
        summary: 'Failed to close pull request due to missing context',
        details: 'The tool context is missing required repository information or GitHub token.'
      };
    }

    const octokit = new Octokit({ auth: context.gitHubToken });

    try {
      const { data } = await octokit.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.name,
        pull_number,
        state: 'closed',
      });

      return {
        success: true,
        content: `Pull request #${pull_number} closed successfully.`,
        summary: `Closed pull request #${pull_number}`,
        details: `Pull request #${pull_number} was closed in the repository ${context.repo.owner}/${context.repo.name}.`,
      };
    } catch (error) {
      console.error('Error closing pull request:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        content: 'Failed to close pull request.',
        summary: 'Error closing pull request',
        details: `Error: ${errorMessage}`,
      };
    }
  },
});