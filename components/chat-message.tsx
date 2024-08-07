// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx
import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAgents, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'

export interface ChatMessageProps {
    message: Message & { toolInvocations?: any[] }
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
    const renderToolResult = (result: any) => {
        if (typeof result === 'string') {
            return result;
        }
        if (typeof result === 'object') {
            return (
                <div>
                    {result.success !== undefined && (
                        <div>Success: {result.success.toString()}</div>
                    )}
                    {result.content && <div>Content: {result.content}</div>}
                    {result.summary && <div>Summary: {result.summary}</div>}
                    {result.details && (
                        <div>
                            Details:
                            <pre>{JSON.stringify(result.details, null, 2)}</pre>
                        </div>
                    )}
                </div>
            );
        }
        return JSON.stringify(result);
    };

    const renderToolInvocation = (toolInvocation: any) => {
        return (
            <div key={toolInvocation.toolCallId} className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <div className="font-semibold">{toolInvocation.toolName}</div>
                <div className="text-sm">
                    {toolInvocation.args && (
                        <div>Args: {JSON.stringify(toolInvocation.args)}</div>
                    )}
                    {toolInvocation.result && (
                        <div>Result: {renderToolResult(toolInvocation.result)}</div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            className={cn('group relative mb-4 flex items-start md:-ml-12')}
            {...props}
        >
            <div
                className={cn(
                    'flex size-7 shrink-0 select-none items-center justify-center rounded-md border shadow',
                    message.role === 'user'
                        ? 'bg-background'
                        : 'bg-black text-white'
                )}
            >
                {message.role === 'user' ? <IconUser /> : <IconOpenAgents />}
            </div>
            <div className="flex-1 px-1 ml-3 space-y-1 overflow-hidden">
                <MemoizedReactMarkdown
                    className="text-sm break-words leading-relaxed"
                    remarkPlugins={[remarkGfm, remarkMath]}
                    components={{
                        p({ children }) {
                            return <p className="mb-2 last:mb-0">{children}</p>
                        },
                        code({ node, inline, className, children, ...props }) {
                            if (children.length) {
                                if (children[0] == '▍') {
                                    return (
                                        <span className="mt-1 cursor-default animate-pulse">▍</span>
                                    )
                                }
                                children[0] = (children[0] as string).replace('`▍`', '▍')
                            }
                            const match = /language-(\w+)/.exec(className || '')
                            if (inline) {
                                return (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                )
                            }
                            return (
                                <CodeBlock
                                    key={Math.random()}
                                    language={(match && match[1]) || ''}
                                    value={String(children).replace(/\n$/, '')}
                                    {...props}
                                />
                            )
                        }
                    }}
                >
                    {message.content}
                </MemoizedReactMarkdown>
                {message.toolInvocations && message.toolInvocations.map(renderToolInvocation)}
                <ChatMessageActions message={message} />
            </div>
        </div>
    )
}
