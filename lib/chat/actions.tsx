import { createAI, getAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { SpinnerMessage } from '@/components/stocks/message';
import { Chat, Message, Model, Repo } from '@/lib/types';
import { nanoid } from '@/lib/utils';

type AIState = {
    chatId: string
    messages: Message[]
}

type UIState = {
    id: string
    display: React.ReactNode
}

const submitUserMessage = async (content: string, repo: Repo, model: Model) => {
    'use server';

    console.log('User message:', content);
    console.log('Repo:', repo);
    console.log('Model:', model);

    const result = await streamUI({
        initial: <SpinnerMessage />,
        // @ts-ignore
        model: model.provider === 'openai' ? openai(model.id) : anthropic(model.id),
        messages: [{
            role: 'system',
            content: `You are an AI coding agent on OpenAgents.com. You help users interact with their repositories.
            You can view file contents, navigate the repository structure, and provide information about the codebase.
            The current repository is ${repo.owner}/${repo.name} on branch ${repo.branch}. You respond extremely concisely
            like a neutral terminal.`
        }, {
            role: 'user',
            content: `${content}`
        }],
        text: ({ content, done, delta }) => {
            console.log('AI response:', content);
            return (
                <>
                    {content}
                </>
            );
        }
    })
    return {
        id: nanoid(),
        display: (
            <>
                {result.value}
            </>
        )
    }
}

export const AI = createAI<AIState, UIState>({
    actions: {
        submitUserMessage,
    },
    initialAIState: {
        chatId: nanoid(),
        messages: [],
    },
    initialUIState: {
        id: nanoid(),
        display: <SpinnerMessage />,
    },
    onSetAIState: async ({ state, done }) => {
        'use server';
        if (done) {
            // Save chat to database (implement this function)
            // await saveChatToDB(state);
        }
    },
    onGetUIState: async () => {
        'use server';
        const aiState = getAIState() as Chat | undefined;
        if (aiState) {
            return getUIStateFromAIState(aiState);
        }
        return undefined;
    }
});


const getUIStateFromAIState = (aiState: Chat): UIState => {
    const displays = aiState.messages
        .filter(message => message.role !== 'system')
        .map((message, index) => (
            <div key={index}>
                {message.role === 'user' ? 'You: ' : 'Assistant: '}
                {message.content as string}
            </div>
        ));

    return {
        id: aiState.chatId,
        display: <>{displays}</>
    };
}
