import { Chat, BotCard, FileViewer, UserMessage, BotMessage } from './imports'

export const getUIStateFromAIState = (aiState: Chat) => {
    return aiState.messages
        .filter(message => message.role !== 'system')
        .map((message, index) => ({
            id: `${aiState.chatId}-${index}`,
            display:
                message.role === 'tool' ? (
                    message.content.map((tool: any) => {
                        console.log("Tool: ", tool)
                        if (tool.toolName === 'viewFileContents') {
                            // If no path arg, return null after console logging
                            if (!tool.args) {
                                console.log('No args')
                                return null
                            }
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