import { useChat } from '@/hooks/useChat'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useEffect, useState } from 'react'
import { useHudStore } from '@/store/hud'
import { useRepoStore } from '@/store/repo'
import { useModelStore } from '@/store/models'
import { useToolStore } from '@/store/tools'

export interface ChatPanelProps {
  id?: string
  className?: string
  isAtBottom?: boolean
  scrollToBottom?: () => void
}

export function ChatPanel({
  id,
  className,
  isAtBottom,
  scrollToBottom
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
          pane.id === id ? { ...pane, title: 'Chat' } : pane
        )
      }))
    }
  }, [id])

  const { messages, input, handleInputChange, handleSubmit } = useChat({ id: id ? parseInt(id, 10) : undefined })

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
        chat={{ id: id || '', title: 'Chat', messages }}
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