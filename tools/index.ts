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

type ToolName = keyof typeof allTools;

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
  // repoOwner: string;
  // repoName: string;
  // repoBranch: string;
  modelId: string;
}

export const getToolContext = async (body: ToolContextBody): Promise<ToolContext> => {
  const { modelId } = body
  // const { repoOwner, repoName, repoBranch, modelId } = body;
  // const repo: Repo = {
  //   owner: repoOwner,
  //   name: repoName,
  //   branch: repoBranch
  // };
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

  return {
    // repo,
    user: user as User | null,
    gitHubToken,
    firecrawlToken,
    greptileToken,
    model
  };
};
