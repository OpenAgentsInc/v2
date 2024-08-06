import dynamic from 'next/dynamic';
import { Chat, Message } from '@/lib/types'
import { BotCard, BotMessage } from '@/components/stocks';
import { auth } from '@/auth'
import { currentUser } from '@clerk/nextjs/server'
import { createAI, getMutableAIState, getAIState, streamUI, createStreamableValue } from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { getTools } from '@/tools'
import { nanoid } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'

export type AIState = {
    chatId: string
    messages: Message[]
}

export type UIState = {
    id: string
    display: React.ReactNode
}[]

async function submitUserMessage(content: string, repo: any, model: any) {
    'use server'

    const user = await currentUser()
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

    let streamedText = ''
    let textNode: React.ReactNode | null = null

    const result = await streamUI({
        // @ts-ignore
        model: model.provider === 'openai' ? openai(model.id) : anthropic(model.id),
        initial: <SpinnerMessage />,
        system: `\
    You are an AI coding agent on OpenAgents.com. You help users interact with their repositories.
    You can view file contents, navigate the repository structure, and provide information about the codebase.
    The current repository is ${repo?.owner}/${repo?.name} on branch ${repo?.branch}.
        `,
        messages: [
            ...aiState.get().messages.map((message: any) => ({
                role: message.role,
                content: message.content
            }))
        ],
        text: ({ content, done, delta }) => {
            if (done) {
                console.log("Done, updating with content", content)
                streamedText = content
            } else {
                streamedText += delta
                console.log("updated with:", delta)
            }

            textNode = <BotMessage content={streamedText} />
            return textNode
        },
        tools: getTools(aiState, user, repo),
        onFinish: (completion) => {
            console.log("Finished with:", completion)
            const assistantMessage = {
                id: nanoid(),
                role: 'assistant',
                content: streamedText
            }
            aiState.done({
                ...aiState.get(),
                messages: [
                    ...aiState.get().messages,
                    assistantMessage
                ]
            })
        }
    })

    return {
        id: nanoid(),
        display: (
            <>
                {textNode}
                {result.value}
            </>
        )
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

        const session = auth()

        if (session && session.userId) {
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

        const session = auth()

        if (session && session.userId) {
            const { chatId, messages } = state

            const createdAt = new Date()
            const userId = session.userId as string
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

const DynamicFileViewer = dynamic(() => import('@/components/github/file-viewer').then(mod => mod.FileViewer), {
    ssr: false,
    loading: () => <div>Loading file viewer...</div>
});

export const getUIStateFromAIState = (aiState: Chat) => {
    return aiState.messages
        .filter(message => message.role !== 'system')
        .flatMap((message, index) => {
            const displays: React.ReactNode[] = [];

            if (message.role === 'user') {
                displays.push(<UserMessage>{message.content as string}</UserMessage>);
            } else if (message.role === 'assistant') {
                displays.push(<BotMessage content={message.content as string} />);
            } else if (message.role === 'tool') {
                message.content.forEach((tool: any) => {
                    switch (tool.toolName) {
                        case 'viewFileContents':
                            displays.push(
                                <BotCard key={tool.toolCallId}>
                                    <DynamicFileViewer
                                        content={tool.result.content}
                                        filename={tool.result.path}
                                    />
                                </BotCard>
                            );
                            break;
                        case 'viewHierarchy':
                            displays.push(
                                <BotCard key={tool.toolCallId}>
                                    <div>
                                        <h3>File/Folder Hierarchy at {tool.result.path}</h3>
                                        <pre>{tool.result.contents}</pre>
                                    </div>
                                </BotCard>
                            );
                            break;
                        // Add other tool cases as needed
                    }
                });
            }

            return displays.map((display, subIndex) => ({
                id: `${aiState.chatId}-${index}-${subIndex}`,
                display
            }));
        });
};
