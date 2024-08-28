import React, { useMemo } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { CodeBlock } from "@/components/ui/codeblock"
import { IconOpenAgents, IconUser } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { Message } from "@/types"
import { ChatMessageActions } from "./ChatMessageActions"
import { MemoizedReactMarkdown } from "./Markdown"
import { ToolResult } from "./ToolResult"

export interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const renderedToolInvocations = useMemo(() => {
    const renderedSet = new Set<string>();
    const toolInvocations = [...(message.toolInvocations || []), ...(message.tool_invocations || [])];
    
    return toolInvocations.filter(invocation => {
      const key = `${invocation.toolName}-${JSON.stringify(invocation.args)}`;
      if (!renderedSet.has(key)) {
        renderedSet.add(key);
        return true;
      }
      return false;
    });
  }, [message.toolInvocations, message.tool_invocations]);

  return (
    <div
      className={cn('group relative mb-4 flex items-start')}
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
      <div className="flex-1 px-1 ml-3 space-y-2 overflow-hidden">
        {message.content && (
          <MemoizedReactMarkdown
            className="prose prose-full-width dark:prose-invert text-sm break-words leading-relaxed"
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
                  children[0] = (children[0] as string).replace('▍', '')
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
        )}
        {renderedToolInvocations.map(invocation => (
          <ToolResult
            key={invocation.toolCallId}
            toolName={invocation.toolName}
            args={invocation.args}
            result={invocation.state === 'result' ? invocation.result : undefined}
            state={invocation.state}
          />
        ))}
        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}