import { CoreTool, tool } from "ai"
import { z } from "zod"
import { githubListUserRepos } from "@/lib/githubUtils"
import { ToolContext } from "@/types"

const params = z.object({
  perPage: z.number().optional().describe("Number of repositories to fetch (max 100)"),
  sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe("Sorting criteria"),
  direction: z.enum(['asc', 'desc']).optional().describe("Sorting direction"),
});

type Params = z.infer<typeof params>;

type Result = {
  success: boolean;
  repos?: any[];
  error?: string;
  summary: string;
  details: string;
};

export const listReposTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  // name: 'list_repos',
  description: 'Lists the most recent repositories for the authenticated user',
  parameters: params,
  execute: async ({ perPage, sort, direction }: Params): Promise<Result> => {
    console.log("Attempting to execute listRepos")
    if (!context.user || !context.githubToken) {
      return {
        success: false,
        error: "Missing user information or GitHub token",
        summary: "Failed to list repositories due to missing context",
        details: "The tool context is missing required user information or GitHub token."
      };
    }

    try {
      const repos = await githubListUserRepos({
        token: context.githubToken,
        ...(perPage !== undefined && { perPage }),
        ...(sort !== undefined && { sort }),
        ...(direction !== undefined && { direction })
      });

      return {
        success: true,
        repos,
        summary: 'Successfully listed user repositories',
        details: `Retrieved ${repos.length} most recent repositories for the authenticated user.`
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        summary: 'Failed to list user repositories',
        details: `An error occurred while trying to list repositories: ${errorMessage}`
      };
    }
  },
});
