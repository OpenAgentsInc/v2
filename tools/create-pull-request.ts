import { CoreTool, tool } from "ai"
import { z } from "zod"
import { ToolContext } from "@/types"
import { Octokit } from "@octokit/rest"

const params = z.object({
  title: z.string().describe('The title of the pull request'),
  description: z.string().describe('The description of the pull request'),
  head: z.string().describe('The name of the branch where your changes are implemented'),
  base: z.string().describe('The name of the branch you want the changes pulled into'),
});

type Params = z.infer<typeof params>;

type Result = {
  success: boolean;
  content: string;
  summary: string;
  details: string;
};

export const createPullRequestTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  description: 'Creates a new pull request with specified title, description, and branches',
  parameters: params,
  execute: async ({ title, description, head, base }: Params): Promise<Result> => {
    if (!context.repo || !context.githubToken) {
      return {
        success: false,
        content: 'Missing repository information or GitHub token',
        summary: 'Failed to create pull request due to missing context',
        details: 'The tool context is missing required repository information or GitHub token.'
      };
    }

    const octokit = new Octokit({ auth: context.githubToken });

    try {
      const { data } = await octokit.pulls.create({
        owner: context.repo.owner,
        repo: context.repo.name,
        title,
        body: description,
        head,
        base,
      });

      return {
        success: true,
        content: `Pull request #${data.number} created successfully.`,
        summary: `Created pull request #${data.number}`,
        details: `Pull request #${data.number} was created in the repository ${context.repo.owner}/${context.repo.name}. Title: "${title}". Head branch: ${head}. Base branch: ${base}.`,
      };
    } catch (error) {
      console.error('Error creating pull request:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        content: 'Failed to create pull request.',
        summary: 'Error creating pull request',
        details: `Error: ${errorMessage}`,
      };
    }
  },
});
