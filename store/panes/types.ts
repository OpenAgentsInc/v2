import { Pane, PaneInput } from '@/types/pane'

export interface PaneStore {
  panes: Pane[]
  isChatOpen: boolean
  lastPanePosition: { x: number; y: number; width: number; height: number } | null
  isInputFocused: boolean
  isRepoInputOpen: boolean
  addPane: (newPane: PaneInput, shouldTile?: boolean) => void
  removePane: (id: string) => void
  updatePanePosition: (id: string, x: number, y: number) => void
  updatePaneSize: (id: string, width: number, height: number) => void
  setChatOpen: (isOpen: boolean) => void
  setInputFocused: (isFocused: boolean) => void
  setRepoInputOpen: (isOpen: boolean) => void
  openChatPane: (newPane: PaneInput, isCommandKeyHeld?: boolean) => void
  bringPaneToFront: (id: string) => void
  setActivePane: (id: string) => void
}

export type SetFunction = (fn: (state: PaneStore) => Partial<PaneStore>) => void