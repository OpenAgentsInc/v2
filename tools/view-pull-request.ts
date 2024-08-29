import { CoreTool, tool } from "ai"
import { z } from "zod"
import { ToolContext } from "@/types"
import { Octokit } from "@octokit/rest"

const params = z.object({
  pull_number: z.number().describe('The number of the pull request to view'),
});

type Params = z.infer<typeof params>;

type Result = {
  success: boolean;
  content: string;
  summary: string;
  details: string;
};

export const viewPullRequestTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  description: 'View details of a specific pull request',
  parameters: params,
  execute: async ({ pull_number }: Params): Promise<Result> => {
    if (!context.repo || !context.gitHubToken) {
      return {
        success: false,
        content: 'Missing repository information or GitHub token',
        summary: 'Failed to view pull request due to missing context',
        details: 'The tool context is missing required repository information or GitHub token.'
      };
    }

    const octokit = new Octokit({ auth: context.gitHubToken });

    try {
      const { data: pr } = await octokit.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.name,
        pull_number,
      });

      const { data: comments } = await octokit.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.name,
        issue_number: pull_number,
      });

      const { data: commits } = await octokit.pulls.listCommits({
        owner: context.repo.owner,
        repo: context.repo.name,
        pull_number,
      });

      const content = `
Pull Request #${pr.number}
Title: ${pr.title}
State: ${pr.state}
Created by: ${pr.user.login}
Created at: ${pr.created_at}
Updated at: ${pr.updated_at}

Description:
${pr.body}

Comments:
${comments.map(comment => `- ${comment.user.login}: ${comment.body}`).join('\n')}

Commits:
${commits.map(commit => `- ${commit.sha.substring(0, 7)}: ${commit.commit.message}`).join('\n')}
            `.trim();

      return {
        success: true,
        content,
        summary: `Viewed pull request #${pull_number}`,
        details: `Successfully retrieved details for pull request #${pull_number} in ${context.repo.owner}/${context.repo.name}`,
      };
    } catch (error) {
      console.error('Error viewing pull request:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        content: 'Failed to view pull request.',
        summary: 'Error viewing pull request',
        details: `Error: ${errorMessage}`,
      };
    }
  },
});
