import {
    getMutableAIState,
    streamUI,
    createStreamableValue,
    nanoid,
    BotMessage,
    SpinnerMessage,
    BotCard,
    FileViewer,
    z,
    openai
} from './imports'

export async function submitUserMessage(content: string) {
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