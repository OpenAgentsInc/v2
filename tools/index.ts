import { models } from "@/lib/models"
import { Model, Repo, ToolContext } from "@/types"
import { bedrock } from "@ai-sdk/amazon-bedrock"
import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"
import { currentUser, User } from "@clerk/nextjs/server"
import { getGitHubToken } from "@/lib/github/isGitHubUser"
import { closeIssueTool } from "./close-issue"
import { closePullRequestTool } from "./close-pull-request"
import { createBranchTool } from "./create-branch"
import { createFileTool } from "./create-file"
import { createPullRequestTool } from "./create-pull-request"
import { deleteFileTool } from "./delete-file"
import { fetchGitHubIssueTool } from "./fetch-github-issue"
import { listOpenIssuesTool } from "./list-open-issues"
import { listPullRequestsTool } from "./list-pull-requests"
import { openIssueTool } from "./open-issue"
import { postGitHubCommentTool } from "./post-github-comment"
import { rewriteFileTool } from "./rewrite-file"
import { scrapeWebpageTool } from "./scrape-webpage"
import { updatePullRequestTool } from "./update-pull-request"
import { viewFileTool } from "./view-file"
import { viewHierarchyTool } from "./view-hierarchy"
import { viewPullRequestTool } from "./view-pull-request"

export const allTools = {
  create_file: { tool: createFileTool, description: "Create a new file at path with content" },
  rewrite_file: { tool: rewriteFileTool, description: "Rewrite file at path with new content" },
  scrape_webpage: { tool: scrapeWebpageTool, description: "Scrape webpage for information" },
  view_file: { tool: viewFileTool, description: "View file contents at path" },
  view_hierarchy: { tool: viewHierarchyTool, description: "View file/folder hierarchy at path" },
  create_pull_request: { tool: createPullRequestTool, description: "Create a new pull request with specified title, description, and branches" },
  create_branch: { tool: createBranchTool, description: "Creates a new branch in the repository" },
  fetch_github_issue: { tool: fetchGitHubIssueTool, description: "Fetch details of a GitHub issue" },
  post_github_comment: { tool: postGitHubCommentTool, description: "Post a comment on a GitHub issue" },
  update_pull_request: { tool: updatePullRequestTool, description: "Update an existing pull request with new information" },
  close_pull_request: { tool: closePullRequestTool, description: "Close an existing pull request" },
  list_pull_requests: { tool: listPullRequestsTool, description: "List all open pull requests in the repository" },
  view_pull_request: { tool: viewPullRequestTool, description: "View details of a specific pull request" },
  list_open_issues: { tool: listOpenIssuesTool, description: "List all open issues in the repository" },
  close_issue: { tool: closeIssueTool, description: "Close an existing GitHub issue" },
  open_issue: { tool: openIssueTool, description: "Open a new GitHub issue" },
  delete_file: { tool: deleteFileTool, description: "Delete file at path" }
} as const;

type ToolName = keyof typeof allTools;

export const getTools = (context: ToolContext, toolNames: ToolName[], githubToken?: string) => {
  const tools: Partial<Record<ToolName, ReturnType<typeof allTools[ToolName]["tool"]>>> = {};
  toolNames.forEach(toolName => {
    if (allTools[toolName]) {
      tools[toolName] = allTools[toolName].tool({
        ...context,
        gitHubToken: githubToken || context.gitHubToken
      });
    }
  });
  return tools;
};

interface ToolContextBody {
  repoOwner: string;
  repoName: string;
  repoBranch: string;
  model: string;
  githubToken?: string;
}

export const getToolContext = async (body: ToolContextBody): Promise<ToolContext> => {
  const { repoOwner, repoName, repoBranch, model: modelId, githubToken } = body;
  const repo: Repo = {
    owner: repoOwner,
    name: repoName,
    branch: repoBranch
  };
  const user = await currentUser();
  const firecrawlToken = process.env.FIRECRAWL_API_KEY;

  // Find the full model object based on the provided model ID
  const modelObj = models.find((m: Model) => m.id === modelId);
  if (!modelObj) {
    throw new Error('Invalid model ID');
  }

  let model;
  switch (modelObj.provider) {
    case 'anthropic':
      model = anthropic(modelObj.id);
      break;
    case 'openai':
      model = openai(modelObj.id);
      break;
    case 'bedrock':
      model = bedrock(modelObj.id);
      break;
    default:
      throw new Error(`Unsupported model provider: ${modelObj.provider}`);
  }

  // Use the manually set token if available, otherwise fall back to the Clerk user's token
  let finalGitHubToken = githubToken;
  if (!finalGitHubToken && user) {
    finalGitHubToken = await getGitHubToken(user);
  }

  return {
    repo,
    user: user as User | null,
    gitHubToken: finalGitHubToken,
    firecrawlToken,
    model
  };
};