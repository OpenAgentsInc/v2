import { tool, CoreTool } from 'ai';
import { z } from 'zod';
import { Octokit } from "@octokit/rest";
import { ToolContext } from "@/types";

const params = z.object({
    issueNumber: z.number().describe("The number of the GitHub issue to fetch"),
});

type Params = z.infer<typeof params>;

type Result = {
    success: boolean;
    name?: string;
    description?: string;
    comments?: Array<{ user: string; body: string; created_at: string }>;
    error?: string;
    summary: string;
    details: string;
};

export const fetchGitHubIssueTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
    description: "Fetch details of a GitHub issue",
    parameters: params,
    execute: async ({ issueNumber }: Params): Promise<Result> => {
        if (!context.gitHubToken) {
            return {
                success: false,
                error: "GitHub token is required to fetch issue details",
                summary: "Failed to fetch GitHub issue due to missing token",
                details: "The GitHub token is missing from the tool context."
            };
        }

        const octokit = new Octokit({ auth: context.gitHubToken });

        try {
            const { data: issue } = await octokit.issues.get({
                owner: context.repo.owner,
                repo: context.repo.name,
                issue_number: issueNumber,
            });

            const { data: comments } = await octokit.issues.listComments({
                owner: context.repo.owner,
                repo: context.repo.name,
                issue_number: issueNumber,
            });

            const result: Result = {
                success: true,
                name: issue.title,
                description: issue.body,
                comments: comments.map((comment) => ({
                    user: comment.user.login,
                    body: comment.body,
                    created_at: comment.created_at,
                })),
                summary: `Fetched GitHub issue #${issueNumber}`,
                details: `Successfully retrieved details for GitHub issue #${issueNumber} in ${context.repo.owner}/${context.repo.name}`
            };

            return result;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error fetching GitHub issue:", errorMessage);
            return {
                success: false,
                error: errorMessage,
                summary: `Failed to fetch GitHub issue #${issueNumber}`,
                details: `An error occurred while fetching GitHub issue #${issueNumber} in ${context.repo.owner}/${context.repo.name}. Error: ${errorMessage}`
            };
        }
    },
});