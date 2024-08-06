import { Repo, ToolContext } from "@/types"
import { currentUser, User } from '@clerk/nextjs/server'
import { createFileTool } from './create-file'
import { listReposTool } from './list-repos'
import { rewriteFileTool } from './rewrite-file'
import { viewFileTool } from './view-file'
import { viewHierarchyTool } from './view-hierarchy'
import { getGitHubToken } from "@/lib/github/isGitHubUser"

export const getTools = (context: ToolContext) => ({
    create_file: createFileTool(context),
    list_repos: listReposTool(context),
    rewrite_file: rewriteFileTool(context),
    view_file: viewFileTool(context),
    view_hierarchy: viewHierarchyTool(context)
})

interface ToolContextBody {
    repoOwner: string;
    repoName: string;
    repoBranch: string;
}

export const getToolContext = async (body: ToolContextBody): Promise<ToolContext> => {
    const { repoOwner, repoName, repoBranch } = body
    const repo: Repo = {
        owner: repoOwner,
        name: repoName,
        branch: repoBranch
    }
    const user = await currentUser()
    const gitHubToken = user ? await getGitHubToken(user) : undefined
    const firecrawlToken = process.env.FIRECRAWL_API_KEY

    return {
        repo,
        user: user as User | null,
        gitHubToken,
        firecrawlToken
    }
}
