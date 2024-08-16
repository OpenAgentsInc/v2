import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Pane, PaneInput } from '@/types/pane'
import { calculatePanePosition } from './paneUtils'
import * as actions from './hudActions'
import { PaneStore } from './types'

export const usePaneStore = create<PaneStore>()(
  persist(
    (set) => ({
      panes: [
        {
          id: 'chats',
          type: 'chats',
          title: 'Chats',
          x: 200,
          y: 220,
          width: 300,
          height: 400,
          isOpen: true,
          dismissable: false,
        },
      ],
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
      openChatPane: (newPane: PaneInput) => actions.openChatPane(set, newPane),
      bringPaneToFront: (id: string) => actions.bringPaneToFront(set, id),
      setActivePane: (id: string) => actions.setActivePane(set, id),
    }),
    {
      name: 'openagents-hud-storage-12937612312', // + Math.random(),
      partialize: (state) => ({ panes: state.panes, lastPanePosition: state.lastPanePosition }),
    }
  )
)

export { calculatePanePosition }
