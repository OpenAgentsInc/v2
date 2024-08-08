import { create } from "zustand"
import { persist } from "zustand/middleware"

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
}

type PaneInput = Omit<Pane, 'x' | 'y' | 'width' | 'height'> & {
    paneProps?: {
        x: number
        y: number
        width: number
        height: number
    }
}

type HudStore = {
    panes: Pane[]
    isChatOpen: boolean
    activeTerminalId: number | null
    lastPanePosition: { x: number; y: number; width: number; height: number } | null
    addPane: (pane: PaneInput) => void
    removePane: (id: string) => void
    updatePanePosition: (id: string, x: number, y: number) => void
    updatePaneSize: (id: string, width: number, height: number) => void
    setChatOpen: (isOpen: boolean) => void
    setActiveTerminalId: (id: number | null) => void
    isInputFocused: boolean
    setInputFocused: (isFocused: boolean) => void
    isRepoInputOpen: boolean
    setRepoInputOpen: (isOpen: boolean) => void
    openChatPane: (pane: PaneInput) => void
}

const initialChatPane: Pane = {
    id: 'default-chat',
    title: 'Chat',
    x: (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2 - 400,
    y: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.05,
    width: 800,
    height: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.9,
    type: 'chat'
}

export const useHudStore = create<HudStore>()(
    persist(
        (set) => ({
            panes: [initialChatPane],
            isChatOpen: true,
            activeTerminalId: null,
            lastPanePosition: null,
            addPane: (newPane) => set((state) => {
                const panePosition = newPane.paneProps || state.lastPanePosition || calculatePanePosition(state.panes.length)
                const newPaneWithPosition: Pane = {
                    ...newPane,
                    x: panePosition.x,
                    y: panePosition.y,
                    width: panePosition.width,
                    height: panePosition.height
                }
                return {
                    panes: [...state.panes, newPaneWithPosition],
                    isChatOpen: newPane.type === 'chat' ? true : state.isChatOpen,
                    lastPanePosition: panePosition
                }
            }),
            removePane: (id) => set((state) => {
                const removedPane = state.panes.find(pane => pane.id === id)
                return {
                    panes: state.panes.filter(pane => pane.id !== id),
                    isChatOpen: state.panes.filter(pane => pane.id !== id && pane.type === 'chat').length > 0,
                    lastPanePosition: removedPane ? { x: removedPane.x, y: removedPane.y, width: removedPane.width, height: removedPane.height } : state.lastPanePosition
                }
            }),
            updatePanePosition: (id, x, y) => set((state) => {
                const updatedPane = state.panes.find(pane => pane.id === id)
                return {
                    panes: state.panes.map(pane =>
                        pane.id === id ? { ...pane, x, y } : pane
                    ),
                    lastPanePosition: updatedPane ? { ...updatedPane, x, y } : state.lastPanePosition
                }
            }),
            updatePaneSize: (id, width, height) => set((state) => {
                const updatedPane = state.panes.find(pane => pane.id === id)
                return {
                    panes: state.panes.map(pane =>
                        pane.id === id ? { ...pane, width, height } : pane
                    ),
                    lastPanePosition: updatedPane ? { ...updatedPane, width, height } : state.lastPanePosition
                }
            }),
            setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
            setActiveTerminalId: (id) => set({ activeTerminalId: id }),
            isInputFocused: false,
            setInputFocused: (isFocused) => set({ isInputFocused: isFocused }),
            isRepoInputOpen: false,
            setRepoInputOpen: (isOpen) => set({ isRepoInputOpen: isOpen }),
            openChatPane: (newPane) => set((state) => {
                const panePosition = newPane.paneProps || state.lastPanePosition || calculatePanePosition(0)
                const newPaneWithPosition: Pane = {
                    ...newPane,
                    x: panePosition.x,
                    y: panePosition.y,
                    width: panePosition.width,
                    height: panePosition.height
                }
                return {
                    panes: [
                        ...state.panes.filter(pane => pane.type !== 'chat'),
                        newPaneWithPosition
                    ],
                    isChatOpen: true,
                    lastPanePosition: panePosition
                }
            }),
        }),
        {
            name: 'openagents-hud-storage-51',
            partialize: (state) => ({ panes: state.panes, lastPanePosition: state.lastPanePosition }),
        }
    )
)

function calculatePanePosition(paneCount: number): { x: number; y: number; width: number; height: number } {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

    // Center the initial chat pane
    if (paneCount === 0) {
        return {
            x: screenWidth / 2 - 400,
            y: screenHeight * 0.1,
            width: 800,
            height: screenHeight * 0.8
        }
    }

    // For additional panes, use the previous offset logic
    return {
        x: screenWidth * 0.3 + (paneCount * 20),
        y: 80 + (paneCount * 20),
        width: screenWidth * 0.4,
        height: screenHeight * 0.8
    }
}