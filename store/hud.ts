import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Pane = {
    id: number
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

type PaneInput = Omit<Pane, 'x' | 'y' | 'width' | 'height' | 'id'> & {
    id?: number;
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
    removePane: (id: number) => void
    updatePanePosition: (id: number, x: number, y: number) => void
    updatePaneSize: (id: number, width: number, height: number) => void
    setChatOpen: (isOpen: boolean) => void
    setActiveTerminalId: (id: number | null) => void
    isInputFocused: boolean
    setInputFocused: (isFocused: boolean) => void
    isRepoInputOpen: boolean
    setRepoInputOpen: (isOpen: boolean) => void
    openChatPane: (pane: PaneInput) => void
    bringPaneToFront: (id: number) => void
    setActivePane: (id: number) => void
}

const initialChatPane: Pane = {
    id: 0,
    title: 'Chat',
    x: (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2 - 400,
    y: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.05,
    width: 800,
    height: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.9,
    type: 'chat',
    isActive: true
}

const PANE_OFFSET = 45 // Offset for new panes when tiling

export const useHudStore = create<HudStore>()(
    persist(
        (set) => ({
            panes: [initialChatPane],
            isChatOpen: true,
            activeTerminalId: null,
            lastPanePosition: null,
            addPane: (newPane, shouldTile = false) => set((state) => {
                const paneId = newPane.id !== undefined ? newPane.id : Math.max(0, ...state.panes.map(p => p.id)) + 1;
                let updatedPanes: Pane[]
                let panePosition

                const existingPane = state.panes.find(pane => pane.id === paneId)
                if (existingPane) {
                    return {
                        panes: [
                            ...state.panes.filter(pane => pane.id !== paneId).map(pane => ({ ...pane, isActive: false })),
                            { ...existingPane, isActive: true }
                        ],
                        isChatOpen: true,
                        lastPanePosition: { x: existingPane.x, y: existingPane.y, width: existingPane.width, height: existingPane.height }
                    }
                }

                if (shouldTile) {
                    // Tiling behavior: add a new pane
                    const lastPane = state.panes[state.panes.length - 1]
                    panePosition = lastPane ? {
                        x: lastPane.x + PANE_OFFSET,
                        y: lastPane.y + PANE_OFFSET,
                        width: lastPane.width,
                        height: lastPane.height
                    } : calculatePanePosition(state.panes.length)
                    updatedPanes = state.panes.map(pane => ({ ...pane, isActive: false }))
                } else {
                    // Non-tiling behavior: replace the active pane or all panes if there's only one
                    const chatPanes = state.panes.filter(pane => pane.type === 'chat')
                    if (chatPanes.length <= 1) {
                        // If there's only one or no chat panes, replace all panes
                        panePosition = chatPanes[0] || calculatePanePosition(0)
                        updatedPanes = state.panes.filter(pane => pane.type !== 'chat')
                    } else {
                        // If there are multiple chat panes, replace only the active one
                        const activePane = chatPanes.find(pane => pane.isActive) || chatPanes[chatPanes.length - 1]
                        panePosition = {
                            x: activePane.x,
                            y: activePane.y,
                            width: activePane.width,
                            height: activePane.height
                        }
                        updatedPanes = state.panes.map(pane =>
                            pane.id === activePane.id ? { ...pane, isActive: false } : pane
                        )
                    }
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
                    id: paneId,
                    ...adjustedPosition,
                    isActive: true
                }

                return {
                    panes: [...updatedPanes, newPaneWithPosition],
                    isChatOpen: true,
                    lastPanePosition: adjustedPosition
                }
            }),
            removePane: (id) => set((state) => {
                const removedPane = state.panes.find(pane => pane.id === id)
                const remainingPanes = state.panes.filter(pane => pane.id !== id)
                const newActivePaneId = remainingPanes.length > 0 ? remainingPanes[remainingPanes.length - 1].id : null

                return {
                    panes: remainingPanes.map(pane => ({
                        ...pane,
                        isActive: pane.id === newActivePaneId
                    })),
                    isChatOpen: remainingPanes.some(pane => pane.type === 'chat'),
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
                    height: panePosition.height,
                    isActive: true,
                    id: Math.max(0, ...state.panes.map(p => p.id)) + 1
                }
                return {
                    panes: [
                        ...state.panes.filter(pane => pane.type !== 'chat').map(pane => ({ ...pane, isActive: false })),
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
                        ...state.panes.filter(pane => pane.id !== id).map(pane => ({ ...pane, isActive: false })),
                        { ...paneToMove, isActive: true }
                    ],
                    lastPanePosition: { x: paneToMove.x, y: paneToMove.y, width: paneToMove.width, height: paneToMove.height }
                }
            }),
            setActivePane: (id) => set((state) => ({
                panes: state.panes.map(pane => ({
                    ...pane,
                    isActive: pane.id === id
                }))
            })),
        }),
        {
            name: 'openagents-hud-storage-1523',
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
