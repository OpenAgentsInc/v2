import { useCallback } from 'react'
import { usePaneStore } from '@/store/pane'
import { Id } from '@/convex/_generated/dataModel'

export function useOpenChatPane() {
  const openChatPane = usePaneStore(state => state.openChatPane)

  const handleOpenChatPane = useCallback((chatId: Id<"threads">, title: string, isCommandKeyHeld: boolean) => {
    const newPane = {
      id: chatId,
      title: title,
      type: 'chat' as const,
      chatId: chatId
    }
    openChatPane(newPane, isCommandKeyHeld)
  }, [openChatPane])

  return handleOpenChatPane
}
