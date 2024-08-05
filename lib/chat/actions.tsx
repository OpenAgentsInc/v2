import 'server-only'

import {
    createAI,
    createStreamableUI,
    getMutableAIState,
    getAIState,
    streamUI,
    createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

import {
    spinner,
    BotCard,
    BotMessage,
    SystemMessage,
    Stock,
    Purchase
} from '@/components/stocks'

import { z } from 'zod'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import {
    formatNumber,
    runAsyncFnWithoutBlocking,
    sleep,
    nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'

// Import the new GitHub-related functions and components
import { viewFileContents } from '@/lib/github/actions/viewFile'
import { FileViewer } from '@/lib/github/components/FileViewer'

async function confirmPurchase(symbol: string, price: number, amount: number) {
    'use server'

    const aiState = getMutableAIState<typeof AI>()

    const purchasing = createStreamableUI(
        <div className="inline-flex items-start gap-1 md:items-center">
            {spinner}
            <p className="mb-2">
                Purchasing {amount} ${symbol}...
            </p>
        </div>
    )

    const systemMessage = createStreamableUI(null)

    runAsyncFnWithoutBlocking(async () => {
        await sleep(1000)

        purchasing.update(
            <div className="inline-flex items-start gap-1 md:items-center">
                {spinner}
                <p className="mb-2">
                    Purchasing {amount} ${symbol}... working on it...
                </p>
            </div>
        )

        await sleep(1000)

        purchasing.done(
            <div>
                <p className="mb-2">
                    You have successfully purchased {amount} ${symbol}. Total cost:{' '}
                    {formatNumber(amount * price)}
                </p>
            </div>
        )

        systemMessage.done(
            <SystemMessage>
                You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
                {formatNumber(amount * price)}.
            </SystemMessage>
        )

        aiState.done({
            ...aiState.get(),
            messages: [
                ...aiState.get().messages,
                {
                    id: nanoid(),
                    role: 'system',
                    content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${amount * price
                        }]`
                }
            ]
        })
    })

    return {
        purchasingUI: purchasing.value,
        newMessage: {
            id: nanoid(),
            display: systemMessage.value
        }
    }
}

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
    You are a GitHub repository assistant that can help users interact with their repositories.
    You can view file contents, navigate the repository structure, and provide information about the codebase.
    
    If the user requests to view a file, call \`view_file_contents\` to show the file contents.
    If the user wants information about the repository structure, you can describe it based on the information you have.
    If the user asks about specific code or functionality, you can provide explanations based on the file contents you've viewed.
    
    Besides that, you can also chat with users and answer general questions about GitHub and version control.`,
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
        tools: {
            viewFileContents: {
                description: 'View the contents of a file in the GitHub repository',
                parameters: z.object({
                    repo: z.string().describe('The repository name (e.g., "owner/repo")'),
                    path: z.string().describe('The file path within the repository'),
                    ref: z.string().optional().describe('The branch or commit reference (optional)')
                }),
                generate: async function*({ repo, path, ref }) {
                    yield (
                        <BotCard>
                            <div>Loading file contents...</div>
                        </BotCard>
                    )

                    try {
                        const content = await viewFileContents(repo, path, ref)
                        const toolCallId = nanoid()

                        aiState.done({
                            ...aiState.get(),
                            messages: [
                                ...aiState.get().messages,
                                {
                                    id: nanoid(),
                                    role: 'assistant',
                                    content: [
                                        {
                                            type: 'tool-call',
                                            toolName: 'viewFileContents',
                                            toolCallId,
                                            args: { repo, path, ref }
                                        }
                                    ]
                                },
                                {
                                    id: nanoid(),
                                    role: 'tool',
                                    content: [
                                        {
                                            type: 'tool-result',
                                            toolName: 'viewFileContents',
                                            toolCallId,
                                            result: content
                                        }
                                    ]
                                }
                            ]
                        })

                        return (
                            <BotCard>
                                <FileViewer content={content} filename={path} />
                            </BotCard>
                        )
                    } catch (error) {
                        console.error('Error fetching file contents:', error)
                        return (
                            <BotCard>
                                <div>Error: Unable to fetch file contents. Please check the file path and try again.</div>
                            </BotCard>
                        )
                    }
                }
            },
            // ... (keep other existing tools)
        }
    })

    return {
        id: nanoid(),
        display: result.value
    }
}

export type AIState = {
    chatId: string
    messages: Message[]
}

export type UIState = {
    id: string
    display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
    actions: {
        submitUserMessage,
        confirmPurchase
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
                        if (tool.toolName === 'viewFileContents') {
                            return (
                                <BotCard>
                                    <FileViewer content={tool.result} filename={tool.args.path} />
                                </BotCard>
                            )
                        }
                        // ... (keep other tool renderings)
                        return null
                    })
                ) : message.role === 'user' ? (
                    <UserMessage>{message.content as string}</UserMessage>
                ) : message.role === 'assistant' &&
                    typeof message.content === 'string' ? (
                    <BotMessage content={message.content} />
                ) : null
        }))
}