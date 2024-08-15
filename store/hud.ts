import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Id } from '@/convex/_generated/dataModel'
import { Pane, PaneInput, HudStore } from './types'
import { calculatePanePosition } from './paneUtils'
import * as actions from './hudActions'

export const useHudStore = create<HudStore>()(
  persist(
    (set) => ({
      panes: [],
      isChatOpen: true,
      activeTerminalId: null,
      lastPanePosition: null,
      addPane: (newPane: PaneInput, shouldTile = false) => actions.addPane(set, newPane, shouldTile),
      removePane: (id: string) => actions.removePane(set, id),
      updatePanePosition: (id: string, x: number, y: number) => actions.updatePanePosition(set, id, x, y),
      updatePaneSize: (id: string, width: number, height: number) => actions.updatePaneSize(set, id, width, height),
      setChatOpen: (isOpen: boolean) => set({ isChatOpen: isOpen }),
      setActiveTerminalId: (id: string | null) => set({ activeTerminalId: id }),
      isInputFocused: false,
      setInputFocused: (isFocused: boolean) => set({ isInputFocused: isFocused }),
      isRepoInputOpen: false,
      setRepoInputOpen: (isOpen: boolean) => set({ isRepoInputOpen: isOpen }),
      openChatPane: (newPane: PaneInput) => actions.openChatPane(set, newPane),
      bringPaneToFront: (id: string) => actions.bringPaneToFront(set, id),
      setActivePane: (id: string) => actions.setActivePane(set, id),
    }),
    {
      name: 'openagents-hud-storage',
      partialize: (state) => ({ panes: state.panes, lastPanePosition: state.lastPanePosition }),
    }
  )
)

export { calculatePanePosition }