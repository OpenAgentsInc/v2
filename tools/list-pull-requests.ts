import { z } from 'zod';
import { tool, CoreTool } from 'ai';
import { Octokit } from '@octokit/rest';
import { ToolContext } from '@/types';

const params = z.object({
  owner: z.string().describe('The owner of the repository'),
  repo: z.string().describe('The name of the repository'),
});

type Params = z.infer<typeof params>;

type Result = {
  success: boolean;
  pullRequests?: Array<{
    number: number;
    title: string;
    url: string;
    created_at: string;
    user?: string;
  }>;
  summary: string;
  details: string;
  error?: string;
};

export const listPullRequestsTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  description: 'Lists open pull requests in a repository',
  parameters: params,
  execute: async ({ owner, repo }: Params): Promise<Result> => {
    if (!context.gitHubToken) {
      return {
        success: false,
        summary: 'Failed to list pull requests due to missing GitHub token',
        details: 'The tool context is missing the required GitHub token.',
      };
    }

    const octokit = new Octokit({ auth: context.gitHubToken });

    try {
      const response = await octokit.pulls.list({
        owner,
        repo,
        state: 'open',
        sort: 'created',
        direction: 'desc',
      });

      const pullRequests = response.data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        created_at: pr.created_at,
        user: pr.user?.login,
      }));

      return {
        success: true,
        pullRequests,
        summary: `Listed ${pullRequests.length} open pull requests for ${owner}/${repo}`,
        details: `Successfully retrieved open pull requests for ${owner}/${repo}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        summary: `Error listing pull requests for ${owner}/${repo}`,
        details: `An error occurred while trying to list pull requests for ${owner}/${repo}: ${errorMessage}`,
        error: `Failed to list pull requests: ${errorMessage}`,
      };
    }
  },
});