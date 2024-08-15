import { create } from "zustand"
import { persist } from "zustand/middleware"
import { calculatePanePosition } from './paneUtils'
import * as actions from './hudActions'
import { PaneStore, PaneInput } from './types'

export const usePaneStore = create<PaneStore>()(
  persist(
    (set) => ({
      panes: [],
      isChatOpen: true,
      activeTerminalId: null,
      lastPanePosition: null,
      addPane: (pane, shouldTile = false) => actions.addPane(set, pane, shouldTile),
      removePane: (id) => actions.removePane(set, id),
      updatePanePosition: (id, x, y) => actions.updatePanePosition(set, id, x, y),
      updatePaneSize: (id, width, height) => actions.updatePaneSize(set, id, width, height),
      setChatOpen: (isOpen: boolean) => set({ isChatOpen: isOpen }),
      setActiveTerminalId: (id) => set({ activeTerminalId: id }),
      isInputFocused: false,
      setInputFocused: (isFocused: boolean) => set({ isInputFocused: isFocused }),
      isRepoInputOpen: false,
      setRepoInputOpen: (isOpen: boolean) => set({ isRepoInputOpen: isOpen }),
      openChatPane: (pane) => actions.openChatPane(set, pane),
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