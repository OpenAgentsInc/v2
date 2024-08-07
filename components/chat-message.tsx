// components/chat-message.tsx
"use client"

import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAgents, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { FileViewer } from '@/components/github/file-viewer'
import { ToolResult } from '@/components/tool-result'

export interface ChatMessageProps {
    message: Message & { toolInvocations?: any[] }
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
    const renderToolInvocation = (toolInvocation: any) => {
        return (
            <ToolResult
                key={toolInvocation.toolCallId}
                toolName={toolInvocation.toolName}
                args={toolInvocation.args}
                result={toolInvocation.result}
                state={toolInvocation.result ? 'result' : 'call'}
            />
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
                                children[0] = (children[0] as string).replace('▍', '▍')
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
