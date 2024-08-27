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
  content: string;
  summary: string;
  details: string;
};

export const listOpenIssuesTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  description: 'Lists open issues in a repository',
  parameters: params,
  execute: async ({ owner, repo }: Params): Promise<Result> => {
    if (!context.gitHubToken) {
      return {
        success: false,
        content: 'Missing GitHub token',
        summary: 'Failed to list open issues due to missing GitHub token',
        details: 'The tool context is missing the required GitHub token.',
      };
    }

    const octokit = new Octokit({ auth: context.gitHubToken });

    try {
      const response = await octokit.issues.listForRepo({
        owner,
        repo,
        state: 'open',
      });

      const issues = response.data.map((issue) => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        user: issue.user.login,
      }));

      return {
        success: true,
        content: JSON.stringify(issues, null, 2),
        summary: `Successfully fetched ${issues.length} open issues`,
        details: `Retrieved ${issues.length} open issues from the repository ${owner}/${repo}.`,
      };
    } catch (error) {
      console.error('Error listing open issues:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        content: 'Failed to list open issues.',
        summary: 'Error listing open issues',
        details: `Error: ${errorMessage}`,
      };
    }
  },
});