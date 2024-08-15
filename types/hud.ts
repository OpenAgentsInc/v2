import { Id } from '@/convex/_generated/dataModel'

export type Pane = {
  id: Id<"threads"> | number
  title: string
  x: number
  y: number
  width: number
  height: number
  type: 'default' | 'chat' | 'diff'
  content?: {
    oldContent?: string
    newContent?: string
  }
  isActive?: boolean
}

export type PaneInput = Omit<Pane, 'x' | 'y' | 'width' | 'height' | 'id'> & {
  id?: Id<"threads"> | number;
  paneProps?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export type HudStore = {
  panes: Pane[]
  isChatOpen: boolean
  activeTerminalId: number | null
  lastPanePosition: { x: number; y: number; width: number; height: number } | null
  addPane: (pane: PaneInput, shouldTile?: boolean) => void
  removePane: (id: Id<"threads"> | number) => void
  updatePanePosition: (id: Id<"threads"> | number, x: number, y: number) => void
  updatePaneSize: (id: Id<"threads"> | number, width: number, height: number) => void
  setChatOpen: (isOpen: boolean) => void
  setActiveTerminalId: (id: number | null) => void
  isInputFocused: boolean
  setInputFocused: (isFocused: boolean) => void
  isRepoInputOpen: boolean
  setRepoInputOpen: (isOpen: boolean) => void
  openChatPane: (pane: PaneInput) => void
  bringPaneToFront: (id: Id<"threads"> | number) => void
  setActivePane: (id: Id<"threads"> | number) => void
}