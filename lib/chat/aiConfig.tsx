import { createAI, getMutableAIState, getAIState } from './imports'
import { submitUserMessage } from './submitUserMessage'
import { getUIStateFromAIState } from './getUIStateFromAIState'

export const AI = createAI({
    actions: {
        submitUserMessage
    },
    initialAIState: {
        chatId: '',
        messages: []
    },
    getUIStateFromAIState
})

export const getAI = () => getAIState<typeof AI>()
export const getMutableAI = () => getMutableAIState<typeof AI>()