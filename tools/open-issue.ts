import { Octokit } from "@octokit/rest";
import { ToolContext } from "@/types";

export const openIssueTool = (context: ToolContext) => {
  return async (params: { title: string; body: string }) => {
    const { title, body } = params;
    const { repo, gitHubToken } = context;

    if (!gitHubToken) {
      throw new Error("GitHub token is required to open an issue");
    }

    const octokit = new Octokit({ auth: gitHubToken });

    try {
      const response = await octokit.issues.create({
        owner: repo.owner,
        repo: repo.name,
        title,
        body,
      });

      return {
        success: true,
        data: {
          issueNumber: response.data.number,
          issueUrl: response.data.html_url,
        },
        message: `Issue created successfully. Issue number: ${response.data.number}`,
      };
    } catch (error) {
      console.error("Error creating issue:", error);
      return {
        success: false,
        error: "Failed to create issue",
      };
    }
  };
};