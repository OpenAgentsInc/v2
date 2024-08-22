import { getGitHubToken } from "@/lib/github/isGitHubUser"
import { models } from "@/lib/models"
import { Model, Repo, ToolContext } from "@/types"
import { bedrock } from "@ai-sdk/amazon-bedrock"
import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"
import { currentUser, User } from "@clerk/nextjs/server"
import { createBranchTool } from "./create-branch"
import { createFileTool } from "./create-file"
import { createPullRequestTool } from "./create-pull-request"
import { listReposTool } from "./list-repos"
import { rewriteFileTool } from "./rewrite-file"
import { scrapeWebpageTool } from "./scrape-webpage"
import { searchCodebaseTool } from "./search-codebase"
import { viewFileTool } from "./view-file"
import { viewHierarchyTool } from "./view-hierarchy"

const allTools = {
  create_file: createFileTool,
  list_repos: listReposTool,
  rewrite_file: rewriteFileTool,
  scrape_webpage: scrapeWebpageTool,
  view_file: viewFileTool,
  view_hierarchy: viewHierarchyTool,
  create_pull_request: createPullRequestTool,
  create_branch: createBranchTool,
  search_codebase: searchCodebaseTool
} as const;

export type ToolName = keyof typeof allTools;

export const getTools = (context: ToolContext, toolNames: ToolName[]) => {
  const tools: Partial<Record<ToolName, ReturnType<typeof allTools[ToolName]>>> = {};
  toolNames.forEach(toolName => {
    if (allTools[toolName]) {
      tools[toolName] = allTools[toolName](context);
    }
  });
  return tools;
};

interface ToolContextBody {
  repo: Repo | null
  modelId: string;
  repoUrl?: string; // Add optional repoUrl parameter
}

export const getToolContext = async (body: ToolContextBody): Promise<ToolContext> => {
  const { repo, modelId, repoUrl } = body;
  const user = await currentUser();
  const gitHubToken = user ? await getGitHubToken(user) : undefined;
  const firecrawlToken = process.env.FIRECRAWL_API_KEY;
  const greptileToken = process.env.GREPTILE_API_KEY;

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

  // Parse repoUrl if provided
  let parsedRepo = repo;
  if (repoUrl) {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/);
    if (match) {
      const [, owner, name, branch = 'main'] = match;
      parsedRepo = { owner, name, branch };
    } else {
      throw new Error("Invalid repository URL");
    }
  }

  return {
    repo: parsedRepo,
    user: user as User | null,
    gitHubToken,
    firecrawlToken,
    greptileToken,
    model
  };
};