import * as React from 'react'

import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { UserMessage } from './stocks/message'
import { useChat } from '@/lib/hooks/use-chat'
import { Message } from '@/lib/types'

export interface ChatPanelProps {
    id?: string
    title?: string
    isAtBottom: boolean
    scrollToBottom: () => void
    input: string
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function ChatPanel({
    id,
    title,
    isAtBottom,
    scrollToBottom,
    input,
    handleInputChange,
    handleSubmit
}: ChatPanelProps) {
    const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
    const { messages } = useChat({ initialId: id })

    const exampleMessages: any[] = []

    return (
        <div className="w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% dark:from-background/10 dark:from-10% dark:to-background/80">
            <ButtonScrollToBottom
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />

            <div className="mx-auto sm:max-w-2xl sm:px-4">
                <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
                    {messages.length === 0 &&
                        exampleMessages.map((example, index) => (
                            <div
                                key={example.heading}
                                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${index > 1 && 'hidden md:block'
                                    }`}
                                onClick={() => handleSubmit(example.message)}
                            >
                                <div className="text-sm font-semibold">{example.heading}</div>
                                <div className="text-sm text-zinc-600">
                                    {example.subheading}
                                </div>
                            </div>
                        ))}
                </div>

                {messages?.length >= 2 ? (
                    <div className="flex h-12 items-center justify-center">
                        <div className="flex space-x-2">
                            {id && title ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShareDialogOpen(true)}
                                    >
                                        <IconShare className="mr-2" />
                                        Share
                                    </Button>
                                    <ChatShareDialog
                                        open={shareDialogOpen}
                                        onOpenChange={setShareDialogOpen}
                                        onCopy={() => setShareDialogOpen(false)}
                                        shareChat={shareChat}
                                        chat={{
                                            id,
                                            title,
                                            messages
                                        }}
                                    />
                                </>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
                    <PromptForm
                        input={input}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                    />
                    <FooterText className="hidden sm:block" />
                </div>
            </div>
        </div>
    )
}
