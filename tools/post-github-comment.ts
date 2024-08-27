import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { Octokit } from "@octokit/rest";
import { ToolContext } from "@/types";

const params = z.object({
    issueNumber: z.number().describe("The number of the GitHub issue to comment on"),
    comment: z.string().describe("The comment to post on the GitHub issue"),
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    commentUrl?: string;
    error?: string;
    summary: string;
    details: string;
};

export const postGitHubCommentTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    description: "Post a comment on a GitHub issue",
    parameters: params,
    execute: async ({ issueNumber, comment }: Params): Promise<Result> => {
        if (!context.gitHubToken) {
            return {
                success: false,
                error: "GitHub token is required to post a comment",
                summary: "Failed to post GitHub comment due to missing token",
                details: "The GitHub token is missing from the tool context."
            };
        }

        const octokit = new Octokit({ auth: context.gitHubToken });

        try {
            const { data } = await octokit.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.name,
                issue_number: issueNumber,
                body: `${comment}\n\n(Comment from OpenAgents)`,
            });

            return {
                success: true,
                commentUrl: data.html_url,
                summary: `Posted comment on GitHub issue #${issueNumber}`,
                details: `Successfully posted a comment on GitHub issue #${issueNumber} in ${context.repo.owner}/${context.repo.name}. Comment URL: ${data.html_url}`
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error posting GitHub comment:", errorMessage);
            return {
                success: false,
                error: errorMessage,
                summary: `Failed to post comment on GitHub issue #${issueNumber}`,
                details: `An error occurred while posting a comment on GitHub issue #${issueNumber} in ${context.repo.owner}/${context.repo.name}. Error: ${errorMessage}`
            };
        }
    },
});