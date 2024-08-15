import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Id } from '@/convex/_generated/dataModel'
import { Pane, PaneInput, HudStore } from './types'
import { calculatePanePosition } from './paneUtils'
import * as actions from './hudActions'

const initialChatPane: Pane = {
  id: 0,
  title: 'Chat',
  x: (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2 - 300,
  y: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.05,
  width: 800,
  height: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.9,
  type: 'chat',
  isActive: true
}

export const useHudStore = create<HudStore>()(
  persist(
    (set) => ({
      panes: [initialChatPane],
      isChatOpen: true,
      activeTerminalId: null,
      lastPanePosition: null,
      addPane: (newPane: PaneInput, shouldTile = false) => actions.addPane(set, newPane, shouldTile),
      removePane: (id: Id<"threads"> | number) => actions.removePane(set, id),
      updatePanePosition: (id: Id<"threads"> | number, x: number, y: number) => actions.updatePanePosition(set, id, x, y),
      updatePaneSize: (id: Id<"threads"> | number, width: number, height: number) => actions.updatePaneSize(set, id, width, height),
      setChatOpen: (isOpen: boolean) => set({ isChatOpen: isOpen }),
      setActiveTerminalId: (id: number | null) => set({ activeTerminalId: id }),
      isInputFocused: false,
      setInputFocused: (isFocused: boolean) => set({ isInputFocused: isFocused }),
      isRepoInputOpen: false,
      setRepoInputOpen: (isOpen: boolean) => set({ isRepoInputOpen: isOpen }),
      openChatPane: (newPane: PaneInput) => actions.openChatPane(set, newPane),
      bringPaneToFront: (id: Id<"threads"> | number) => actions.bringPaneToFront(set, id),
      setActivePane: (id: Id<"threads"> | number) => actions.setActivePane(set, id),
    }),
    {
      name: 'openagents-hud-storage-15290' + Math.random(), // remove random after we can reset bad positions
      partialize: (state) => ({ panes: state.panes, lastPanePosition: state.lastPanePosition }),
    }
  )
)

export { calculatePanePosition }