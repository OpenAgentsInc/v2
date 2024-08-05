import { listStocks } from './listStocks'
import { viewFileContents } from './viewFileContents'

export const getTools = (aiState: any) => ({
    listStocks: listStocks(aiState),
    viewFileContents: viewFileContents(aiState)
})
