import * as React from 'react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { UserMessage } from './stocks/message'
import { useChat } from '@/hooks/useChat'
import { Message } from '@/lib/types'

const shareChat = async (chat: { id: string; title: string; messages: Message[] }) => {
    console.log("Not implemented")
    return
    const url = new URL(`/chat/${chat.id}`, window.location.href)
    const text = chat.messages
        .map((message) => `${message.author}: ${message.text}`)
        .join('\n')

    await navigator.share({
        title: chat.title,
        text,
        url: url.toString()
    })
}

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

    return (
        <div className="w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% dark:from-background/10 dark:from-10% dark:to-background/80">
            <ButtonScrollToBottom
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />

            <div className="mx-auto sm:max-w-2xl sm:px-4">
                {messages?.length >= 2 && id && title ? (
                    <div className="flex h-10 items-center justify-center">
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
                    </div>
                ) : null}

                <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border">
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
