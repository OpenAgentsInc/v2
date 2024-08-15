import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Pane, PaneInput } from '@/types/pane'
import { calculatePanePosition } from './paneUtils'
import * as actions from './hudActions'
import { PaneStore } from './types'

export const usePaneStore = create<PaneStore>()(
  persist(
    (set) => ({
      panes: [],
      isChatOpen: true,
      activeTerminalId: null,
      lastPanePosition: null,
      addPane: (newPane: PaneInput, shouldTile = false) => actions.addPane(set, newPane, shouldTile),
      removePane: (id) => actions.removePane(set, id),
      updatePanePosition: (id, x, y) => actions.updatePanePosition(set, id, x, y),
      updatePaneSize: (id, width, height) => actions.updatePaneSize(set, id, width, height),
      setChatOpen: (isOpen: boolean) => set({ isChatOpen: isOpen }),
      setActiveTerminalId: (id) => set({ activeTerminalId: id }),
      isInputFocused: false,
      setInputFocused: (isFocused: boolean) => set({ isInputFocused: isFocused }),
      isRepoInputOpen: false,
      setRepoInputOpen: (isOpen: boolean) => set({ isRepoInputOpen: isOpen }),
      openChatPane: (newPane: PaneInput) => actions.openChatPane(set, newPane),
      bringPaneToFront: (id) => actions.bringPaneToFront(set, id),
      setActivePane: (id) => actions.setActivePane(set, id),
    }),
    {
      name: 'openagents-hud-storage-129376123',
      partialize: (state) => ({ panes: state.panes, lastPanePosition: state.lastPanePosition }),
    }
  )
)

export { calculatePanePosition }