import { listStocks } from './listStocks'
import { viewFileContents } from './viewFileContents'
import { Repo } from '@/lib/types'

export const getTools = (aiState: any, repo: Repo | null) => ({
    listStocks: listStocks(aiState),
    viewFileContents: viewFileContents(aiState, repo)
})