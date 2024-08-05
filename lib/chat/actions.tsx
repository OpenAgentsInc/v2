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

// ... (keep the confirmPurchase function as is)

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
        model: openai('gpt-4o'),
        initial: <SpinnerMessage />,
        system: `\
    You are a GitHub repository assistant that can help users interact with their repositories.
    You can view file contents, navigate the repository structure, and provide information about the codebase.
    
    If the user requests to view a file, call \`viewFileContents\` to show the file contents.
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

// ... (keep the AI configuration and other exports as is)

export const getUIStateFromAIState = (aiState: Chat) => {
    return aiState.messages
        .filter(message => message.role !== 'system')
        .map((message, index) => ({
            id: `${aiState.chatId}-${index}`,
            display:
                message.role === 'tool' ? (
                    message.content.map((tool: any) => {
                        if (tool.toolName === 'viewFileContents') {
                            return (
                                <BotCard key={tool.toolCallId}>
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