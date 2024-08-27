import { CoreTool, tool } from "ai"
import { z } from "zod"
import { ToolContext } from "@/types"
import { Octokit } from "@octokit/rest"

const params = z.object({
  issue_number: z.number().describe('The number of the issue to close'),
});

type Params = z.infer<typeof params>;

type Result = {
  success: boolean;
  content: string;
  summary: string;
  details: string;
};

export const closeIssueTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  description: 'Closes an open issue',
  parameters: params,
  execute: async ({ issue_number }: Params): Promise<Result> => {
    if (!context.repo || !context.gitHubToken) {
      return {
        success: false,
        content: 'Missing repository information or GitHub token',
        summary: 'Failed to close issue due to missing context',
        details: 'The tool context is missing required repository information or GitHub token.'
      };
    }

    const octokit = new Octokit({ auth: context.gitHubToken });

    try {
      const { data } = await octokit.issues.update({
        owner: context.repo.owner,
        repo: context.repo.name,
        issue_number,
        state: 'closed',
      });

      return {
        success: true,
        content: `Issue #${issue_number} closed successfully.`,
        summary: `Closed issue #${issue_number}`,
        details: `Issue #${issue_number} was closed in the repository ${context.repo.owner}/${context.repo.name}.`,
      };
    } catch (error) {
      console.error('Error closing issue:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        content: 'Failed to close issue.',
        summary: 'Error closing issue',
        details: `Error: ${errorMessage}`,
      };
    }
  },
});
