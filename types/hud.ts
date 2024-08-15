export type Pane = {
  id: string
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
  id?: string;
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
  activeTerminalId: string | null
  lastPanePosition: { x: number; y: number; width: number; height: number } | null
  addPane: (pane: PaneInput, shouldTile?: boolean) => void
  removePane: (id: string) => void
  updatePanePosition: (id: string, x: number, y: number) => void
  updatePaneSize: (id: string, width: number, height: number) => void
  setChatOpen: (isOpen: boolean) => void
  setActiveTerminalId: (id: string | null) => void
  isInputFocused: boolean
  setInputFocused: (isFocused: boolean) => void
  isRepoInputOpen: boolean
  setRepoInputOpen: (isOpen: boolean) => void
  openChatPane: (pane: PaneInput) => void
  bringPaneToFront: (id: string) => void
  setActivePane: (id: string) => void
}