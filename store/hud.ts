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
    addPane: (pane: PaneInput, shouldTile?: boolean) => void
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
    bringPaneToFront: (id: string) => void
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

const PANE_OFFSET = 50 // Offset for new panes when tiling

export const useHudStore = create<HudStore>()(
    persist(
        (set) => ({
            panes: [initialChatPane],
            isChatOpen: true,
            activeTerminalId: null,
            lastPanePosition: null,
            addPane: (newPane, shouldTile = false) => set((state) => {
                const existingPane = state.panes.find(pane => pane.id === newPane.id)
                if (existingPane) {
                    // If the pane already exists, bring it to the front
                    return {
                        panes: [
                            ...state.panes.filter(pane => pane.id !== newPane.id),
                            existingPane
                        ],
                        isChatOpen: true,
                        lastPanePosition: { x: existingPane.x, y: existingPane.y, width: existingPane.width, height: existingPane.height }
                    }
                }

                let panePosition
                if (shouldTile) {
                    const lastPane = state.panes[state.panes.length - 1]
                    panePosition = lastPane ? {
                        x: lastPane.x + PANE_OFFSET,
                        y: lastPane.y + PANE_OFFSET,
                        width: lastPane.width,
                        height: lastPane.height
                    } : calculatePanePosition(state.panes.length)
                } else {
                    panePosition = newPane.paneProps || state.lastPanePosition || calculatePanePosition(0)
                }

                // Ensure the new pane is within the viewport
                const maxX = (typeof window !== 'undefined' ? window.innerWidth : 1920) - panePosition.width
                const maxY = (typeof window !== 'undefined' ? window.innerHeight : 1080) - panePosition.height
                const adjustedPosition = {
                    x: Math.min(Math.max(panePosition.x, 0), maxX),
                    y: Math.min(Math.max(panePosition.y, 0), maxY),
                    width: panePosition.width,
                    height: panePosition.height
                }

                const newPaneWithPosition: Pane = {
                    ...newPane,
                    ...adjustedPosition
                }
                return {
                    panes: [...state.panes, newPaneWithPosition],
                    isChatOpen: newPane.type === 'chat' ? true : state.isChatOpen,
                    lastPanePosition: adjustedPosition
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
            bringPaneToFront: (id) => set((state) => {
                const paneToMove = state.panes.find(pane => pane.id === id)
                if (!paneToMove) return state
                return {
                    panes: [
                        ...state.panes.filter(pane => pane.id !== id),
                        paneToMove
                    ],
                    lastPanePosition: { x: paneToMove.x, y: paneToMove.y, width: paneToMove.width, height: paneToMove.height }
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

    // For additional panes, use the offset logic
    return {
        x: screenWidth * 0.3 + (paneCount * PANE_OFFSET),
        y: 80 + (paneCount * PANE_OFFSET),
        width: screenWidth * 0.4,
        height: screenHeight * 0.8
    }
}