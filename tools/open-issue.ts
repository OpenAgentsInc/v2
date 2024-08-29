import { CoreTool, tool } from "ai"
import { z } from "zod"
import { ToolContext } from "@/types"
import { Octokit } from "@octokit/rest"

const params = z.object({
  owner: z.string().describe('The owner of the repository'),
  repo: z.string().describe('The name of the repository'),
  title: z.string().describe('The title of the issue'),
  body: z.string().describe('The body content of the issue'),
});

type Params = z.infer<typeof params>;

type Result = {
  success: boolean;
  content: string;
  summary: string;
  details: string;
};

export const openIssueTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  description: 'Opens a new issue with specified title and body in the given repository',
  parameters: params,
  execute: async ({ owner, repo, title, body }: Params): Promise<Result> => {
    if (!context.gitHubToken) {
      return {
        success: false,
        content: 'Missing GitHub token',
        summary: 'Failed to open issue due to missing GitHub token',
        details: 'The tool context is missing the required GitHub token.'
      };
    }

    const octokit = new Octokit({ auth: context.gitHubToken });

    try {
      const { data } = await octokit.issues.create({
        owner,
        repo,
        title,
        body,
      });

      return {
        success: true,
        content: `Issue #${data.number} created successfully.`,
        summary: `Created issue #${data.number}`,
        details: `Issue #${data.number} was created in the repository ${owner}/${repo}. Title: "${title}". URL: ${data.html_url}`,
      };
    } catch (error) {
      console.error('Error creating issue:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        content: 'Failed to create issue.',
        summary: 'Error creating issue',
        details: `Error: ${errorMessage}`,
      };
    }
  },
});
