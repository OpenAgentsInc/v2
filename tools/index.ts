import { listStocks } from './listStocks'
import { viewFileContents } from './viewFileContents'
import { viewHierarchy } from './viewHierarchy'
import { Repo } from '@/lib/types'
import { User } from '@clerk/nextjs/server'

export const getTools = (aiState: any, user: User | null, repo: Repo | null) => ({
    listStocks: listStocks(aiState),
    viewFileContents: viewFileContents(aiState, user, repo),
    viewHierarchy: viewHierarchy(aiState, user, repo)
})
