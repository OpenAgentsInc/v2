import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'
import {
    createAI,
    createStreamableUI,
    getMutableAIState,
    getAIState,
    streamUI,
    createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { getTools } from '@/tools'
import { z } from 'zod'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import {
    formatNumber,
    runAsyncFnWithoutBlocking,
    sleep,
    nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import {
    spinner,
    BotCard,
    BotMessage,
    SystemMessage,
    Stock,
    Purchase
} from '@/components/stocks'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'

export type AIState = {
    chatId: string
    messages: Message[]
}

export type UIState = {
    id: string
    display: React.ReactNode
}[]

async function submitUserMessage(content: string) {
    'use server'

    const aiState = getMutableAIState<typeof AI>()

    aiState.update({
        ...aiState.get(),
        messages: [
            ...aiState.get().messages,
            {
                id: nanoid(),
                role: 'user',
                content
            }
        ]
    })

    let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
    let textNode: undefined | React.ReactNode

    const result = await streamUI({
        // model: anthropic('claude-3-5-sonnet-20240620'),
        model: openai('gpt-4o'),
        initial: <SpinnerMessage />,
        system: `\
    You are an AI coding agent on OpenAgents.com. You help users interact with their repositories.
    You can view file contents, navigate the repository structure, and provide information about the codebase.
        `,
        messages: [
            ...aiState.get().messages.map((message: any) => ({
                role: message.role,
                content: message.content,
                name: message.name
            }))
        ],
        text: ({ content, done, delta }) => {
            if (!textStream) {
                textStream = createStreamableValue('')
                textNode = <BotMessage content={textStream.value} />
            }

            if (done) {
                textStream.done()
                aiState.done({
                    ...aiState.get(),
                    messages: [
                        ...aiState.get().messages,
                        {
                            id: nanoid(),
                            role: 'assistant',
                            content
                        }
                    ]
                })
            } else {
                textStream.update(delta)
            }

            return textNode
        },
        tools: getTools(aiState)
    })

    return {
        id: nanoid(),
        display: result.value
    }
}

export const AI = createAI<AIState, UIState>({
    actions: {
        submitUserMessage
    },
    initialUIState: [],
    initialAIState: { chatId: nanoid(), messages: [] },
    onGetUIState: async () => {
        'use server'

        const session = await auth()

        if (session && session.user) {
            const aiState = getAIState() as Chat

            if (aiState) {
                const uiState = getUIStateFromAIState(aiState)
                return uiState
            }
        } else {
            return
        }
    },
    onSetAIState: async ({ state }) => {
        'use server'

        const session = await auth()

        if (session && session.user) {
            const { chatId, messages } = state

            const createdAt = new Date()
            const userId = session.user.id as string
            const path = `/chat/${chatId}`

            const firstMessageContent = messages[0].content as string
            const title = firstMessageContent.substring(0, 100)

            const chat: Chat = {
                id: chatId,
                title,
                userId,
                createdAt,
                messages,
                path
            }

            await saveChat(chat)
        } else {
            return
        }
    }
})

export const getUIStateFromAIState = (aiState: Chat) => {
    return aiState.messages
        .filter(message => message.role !== 'system')
        .map((message, index) => ({
            id: `${aiState.chatId}-${index}`,
            display:
                message.role === 'tool' ? (
                    message.content.map(tool => {
                        console.log("tool nothing yet", tool)
                        return <></>
                    })
                ) : message.role === 'user' ? (
                    <UserMessage>{message.content as string}</UserMessage>
                ) : message.role === 'assistant' &&
                    typeof message.content === 'string' ? (
                    <BotMessage content={message.content} />
                ) : null
        }))
}
