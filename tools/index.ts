import { viewFileContents } from './viewFileContents'
import { viewHierarchy } from './viewHierarchy'
import { Repo } from '@/lib/types'
import { User } from '@clerk/nextjs/server'

export const getTools = (user: User | null, repo: Repo | null) => ({
    viewFileContents: viewFileContents(user, repo),
    viewHierarchy: viewHierarchy(user, repo)
})
