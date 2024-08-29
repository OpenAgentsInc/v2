import { CoreTool, tool } from "ai"
import { z } from "zod"
import { ToolContext } from "@/types"
import { Octokit } from "@octokit/rest"

const params = z.object({
  title: z.string().describe('The title of the pull request'),
  description: z.string().describe('The description of the pull request'),
  head: z.string().describe('The name of the branch where your changes are implemented'),
  base: z.string().describe('The name of the branch you want the changes pulled into'),
  owner: z.string().optional().describe('The owner of the repository (optional)'),
  repo: z.string().optional().describe('The name of the repository (optional)'),
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
  execute: async ({ title, description, head, base, owner, repo }: Params): Promise<Result> => {
    if (!context.gitHubToken) {
      return {
        success: false,
        content: 'Missing GitHub token',
        summary: 'Failed to create pull request due to missing GitHub token',
        details: 'The tool context is missing the required GitHub token.'
      };
    }

    const repoOwner = owner || context.repo?.owner;
    const repoName = repo || context.repo?.name;

    if (!repoOwner || !repoName) {
      return {
        success: false,
        content: 'Missing repository information',
        summary: 'Failed to create pull request due to missing repository information',
        details: 'Please provide both owner and repo parameters, or ensure they are available in the context.'
      };
    }

    const octokit = new Octokit({ auth: context.gitHubToken });

    try {
      const { data } = await octokit.pulls.create({
        owner: repoOwner,
        repo: repoName,
        title,
        body: description,
        head,
        base,
      });

      return {
        success: true,
        content: `Pull request #${data.number} created successfully.`,
        summary: `Created pull request #${data.number}`,
        details: `Pull request #${data.number} was created in the repository ${repoOwner}/${repoName}. Title: "${title}". Head branch: ${head}. Base branch: ${base}.`,
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
