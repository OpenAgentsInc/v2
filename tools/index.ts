import { Repo, ToolContext } from "@/types"
import { currentUser } from '@clerk/nextjs/server'

export const getTools = (context: ToolContext) => {
    console.log("getTools with context:", context)
    return {}
}

export const getToolContext = async (body: any) => {
    const { repoOwner, repoName, repoBranch } = body
    const repo: Repo = {
        owner: repoOwner,
        name: repoName,
        branch: repoBranch
    }
    const user = await currentUser()
    return { repo, user }
}
