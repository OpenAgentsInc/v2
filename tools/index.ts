import { Repo, ToolContext } from "@/types";
import { currentUser, User } from '@clerk/nextjs/server';
import { createFileTool } from './create-file';
import { listReposTool } from './list-repos';
import { rewriteFileTool } from './rewrite-file';
import { scrapeWebpageTool } from './scrape-webpage';
import { viewFileTool } from './view-file';
import { viewHierarchyTool } from './view-hierarchy';
import { createPullRequestTool } from './create-pull-request';
import { createBranchTool } from './create-branch';
import { searchCodebaseTool } from './search-codebase';
import { getGitHubToken } from "@/lib/github/isGitHubUser";
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { bedrock } from '@ai-sdk/amazon-bedrock';

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
    repoOwner: string;
    repoName: string;
    repoBranch: string;
    model: {
        id: string;
        name: string;
        provider: string;
    };
}

export const getToolContext = async (body: ToolContextBody): Promise<ToolContext> => {
    const { repoOwner, repoName, repoBranch, model: theModel } = body;
    const repo: Repo = {
        owner: repoOwner,
        name: repoName,
        branch: repoBranch
    };
    const user = await currentUser();
    const gitHubToken = user ? await getGitHubToken(user) : undefined;
    const firecrawlToken = process.env.FIRECRAWL_API_KEY;
    const greptileToken = process.env.GREPTILE_API_KEY;

    let model;
    switch (theModel.provider) {
        case 'anthropic':
            model = anthropic(theModel.id);
            break;
        case 'openai':
            model = openai(theModel.id);
            break;
        case 'bedrock':
            model = bedrock(theModel.id);
            break;
        default:
            throw new Error(`Unsupported model provider: ${theModel.provider}`);
    }

    return {
        repo,
        user: user as User | null,
        gitHubToken,
        firecrawlToken,
        greptileToken,
        model
    };
};
