import { ToolContext } from "@/types";
import { Octokit } from "@octokit/rest";

export const fetchGitHubIssueTool = (context: ToolContext) => {
  return async (issueNumber: number) => {
    if (!context.gitHubToken) {
      throw new Error("GitHub token is required to fetch issue details");
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

      return {
        name: issue.title,
        description: issue.body,
        comments: comments.map((comment) => ({
          user: comment.user.login,
          body: comment.body,
          created_at: comment.created_at,
        })),
      };
    } catch (error) {
      console.error("Error fetching GitHub issue:", error);
      throw new Error("Failed to fetch GitHub issue details");
    }
  };
};