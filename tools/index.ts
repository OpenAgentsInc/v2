import { Repo, ToolContext } from "@/types"
import { currentUser, User } from '@clerk/nextjs/server'
import { listReposTool } from './list-repos'
import { viewFileTool } from './view-file'
import { viewHierarchyTool } from './view-hierarchy'
import { getGitHubToken } from "@/lib/github/isGitHubUser"

export const getTools = (context: ToolContext) => ({
    listRepos: listReposTool(context),
    viewFile: viewFileTool(context),
    viewHierarchy: viewHierarchyTool(context)
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

    return {
        repo,
        user: user as User | null,
        gitHubToken
    }
}
