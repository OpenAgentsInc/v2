import { Repo, ToolContext } from "@/types"
import { currentUser, User } from '@clerk/nextjs/server'
import { createFileTool } from './create-file'
import { listReposTool } from './list-repos'
import { rewriteFileTool } from './rewrite-file'
import { scrapeWebpageTool } from './scrape-webpage'
import { viewFileTool } from './view-file'
import { viewHierarchyTool } from './view-hierarchy'
import { createPullRequestTool } from './create-pull-request'
import { createBranchTool } from './create-branch'
import { searchCodebaseTool } from './search-codebase'
import { getGitHubToken } from "@/lib/github/isGitHubUser"
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'

export const getTools = (context: ToolContext) => ({
    create_file: createFileTool(context),
    list_repos: listReposTool(context),
    rewrite_file: rewriteFileTool(context),
    scrape_webpage: scrapeWebpageTool(context),
    view_file: viewFileTool(context),
    view_hierarchy: viewHierarchyTool(context),
    create_pull_request: createPullRequestTool(context),
    create_branch: createBranchTool(context),
    search_codebase: searchCodebaseTool(context)
})

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
    const { repoOwner, repoName, repoBranch, model: theModel } = body
    const repo: Repo = {
        owner: repoOwner,
        name: repoName,
        branch: repoBranch
    }
    const user = await currentUser()
    const gitHubToken = user ? await getGitHubToken(user) : undefined
    const firecrawlToken = process.env.FIRECRAWL_API_KEY
    const greptileToken = process.env.GREPTILE_API_KEY

    const model = theModel.provider === 'anthropic' ? anthropic(theModel.id) : openai(theModel.id)

    return {
        repo,
        user: user as User | null,
        gitHubToken,
        firecrawlToken,
        greptileToken,
        model
    }
}
