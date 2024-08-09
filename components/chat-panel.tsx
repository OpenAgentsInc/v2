import { useChat } from '@/hooks/useChat'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useEffect, useState } from 'react'
import { useHudStore } from '@/store/hud'
import { useRepoStore } from '@/store/repo'
import { useModelStore } from '@/store/models'
import { useToolStore } from '@/store/tools'
import { Message } from '@/types'

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
  isAtBottom,
  scrollToBottom,
  input,
  handleInputChange,
  handleSubmit
}: ChatPanelProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const { removePane } = useHudStore()
  const repo = useRepoStore((state) => state.repo)
  const model = useModelStore((state) => state.model)
  const tools = useToolStore((state) => state.tools)

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

  return (
    <div className={className}>
      {messages.length > 1 && (
        <div className="flex items-center justify-end p-4">
          <button
            onClick={() => setShareDialogOpen(true)}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:underline"
          >
            Share
          </button>
        </div>
      )}
      <ChatShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        chat={{ id: id?.toString() || '', title: 'Chat', messages: messages as Message[] }}
      />
      <div className="p-4 pb-20">
        <PromptForm
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
      {isAtBottom !== undefined && scrollToBottom && (
        <ButtonScrollToBottom
          isAtBottom={isAtBottom}
          scrollToBottom={scrollToBottom}
        />
      )}
    </div>
  )
}