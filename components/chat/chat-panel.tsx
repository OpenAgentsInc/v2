import { useChat } from '@/hooks/useChat'
import { PromptForm } from './prompt-form'
import { InputBar } from '@/components/input/InputBar'
import { ChatShareDialog } from '@/components/share/chat-share-dialog'
import { FooterText } from './footer'
import { useEffect, useState } from 'react'
import { useHudStore } from '@/store/hud'
import { ServerActionResult, Chat } from '@/lib/types'
import { ChatList } from './chat-list'

export interface ChatPanelProps {
    id?: number
    className?: string
    isAtBottom?: boolean
    scrollToBottom?: () => void
    input: string
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function ChatPanel({
    id,
    className,
    input,
    handleInputChange,
    handleSubmit
}: ChatPanelProps) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false)

    useEffect(() => {
        if (id) {
            useHudStore.setState((state) => ({
                panes: state.panes.map((pane) =>
                    pane.id === id.toString() ? { ...pane, title: 'Chat' } : pane
                )
            }))
        }
    }, [id])

    const { messages } = useChat({ id })

    const shareChat = async (id: number): Promise<ServerActionResult<Chat>> => {
        try {
            const response = await fetch('/api/share-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('Failed to share chat');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error sharing chat:', error);
            return {
                success: false,
                error: 'Failed to share chat',
            };
        }
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-grow overflow-auto">
                <ChatList messages={messages} isShared={false} />
                <ChatShareDialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                    chat={{
                        id: id || 0,
                        title: 'Chat',
                        messages: messages
                    }}
                    shareChat={shareChat}
                    onCopy={() => {
                        console.log('Chat link copied')
                    }}
                />
            </div>
            <div className="flex-shrink-0 w-full">
                <FooterText className="px-4 py-2" />
                <div className="w-full h-px bg-white" /> {/* White border */}
                <div className="p-4 w-full">
                    <InputBar
                        onSubmit={(e) => {
                            handleSubmit(e)
                        }}
                    />
                    {/*
                    <PromptForm
                        input={input}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                    />
                */}
                </div>
            </div>
        </div>
    )
}
