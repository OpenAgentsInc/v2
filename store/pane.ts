import { create } from "zustand"
import { persist } from "zustand/middleware"
import { PaneInput } from "@/types/pane"
import { calculatePanePosition } from "./panes"
import * as actions from "./panes/actions"
import { PaneStore } from "./types"

const initialPanes = [
  {
    id: '0',
    type: 'chats',
    title: 'Chats',
    x: 90,
    y: 170,
    width: 260,
    height: 450,
    isOpen: true,
    dismissable: false,
  },
  {
    id: '1',
    type: 'changelog',
    title: 'Changelog',
    x: 390,
    y: 170,
    width: 360,
    height: 350,
    isOpen: true,
    dismissable: true,
  },
]

export const usePaneStore = create<PaneStore>()(
  persist(
    (set) => ({
      panes: initialPanes,
      isChatOpen: true,
      lastPanePosition: null,
      addPane: (newPane: PaneInput, shouldTile = false) => actions.addPane(set, newPane, shouldTile),
      removePane: (id: string) => actions.removePane(set, id),
      updatePanePosition: (id: string, x: number, y: number) => actions.updatePanePosition(set, id, x, y),
      updatePaneSize: (id: string, width: number, height: number) => actions.updatePaneSize(set, id, width, height),
      setChatOpen: (isOpen: boolean) => set({ isChatOpen: isOpen }),
      isInputFocused: false,
      setInputFocused: (isFocused: boolean) => set({ isInputFocused: isFocused }),
      isRepoInputOpen: false,
      setRepoInputOpen: (isOpen: boolean) => set({ isRepoInputOpen: isOpen }),
      openChatPane: (newPane: PaneInput, isCommandKeyHeld: boolean = false) => actions.openChatPane(set, newPane, isCommandKeyHeld),
      bringPaneToFront: (id: string) => actions.bringPaneToFront(set, id),
      setActivePane: (id: string) => actions.setActivePane(set, id),
      resetHUDState: () => set({ panes: initialPanes, lastPanePosition: null }),
    }),
    {
      name: 'openagents-hud-storage-1293761231233x344a',
      partialize: (state) => ({ panes: state.panes, lastPanePosition: state.lastPanePosition }),
    }
  )
)

export { calculatePanePosition }