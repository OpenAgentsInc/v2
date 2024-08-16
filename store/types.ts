import { Pane, PaneInput } from '@/types/pane'

export type PaneStore = {
  panes: Pane[]
  isChatOpen: boolean
  lastPanePosition: { x: number; y: number; width: number; height: number } | null
  addPane: (pane: PaneInput, shouldTile?: boolean) => void
  removePane: (id: string) => void
  updatePanePosition: (id: string, x: number, y: number) => void
  updatePaneSize: (id: string, width: number, height: number) => void
  setChatOpen: (isOpen: boolean) => void
  isInputFocused: boolean
  setInputFocused: (isFocused: boolean) => void
  isRepoInputOpen: boolean
  setRepoInputOpen: (isOpen: boolean) => void
  openChatPane: (pane: PaneInput) => void
  bringPaneToFront: (id: string) => void
  setActivePane: (id: string) => void
}
