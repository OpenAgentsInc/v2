import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Pane = {
    id: string
    title: string
    x: number
    y: number
    width: number
    height: number
    type: 'default' | 'chat' | 'chats' | 'diff'
    content?: {
        oldContent?: string
        newContent?: string
    }
    isActive?: boolean
}

type PaneInput = Omit<Pane, 'x' | 'y' | 'width' | 'height'> & {
    paneProps?: {
        x: number
        y: number
        width: number
        height: number
    }
}

type PaneStore = {
    panes: Pane[]
    lastPanePosition: { x: number; y: number; width: number; height: number } | null
    addPane: (pane: PaneInput, isCommandKeyHeld: boolean) => void
    removePane: (id: string) => void
    updatePanePosition: (id: string, x: number, y: number) => void
    updatePaneSize: (id: string, width: number, height: number) => void
    openChatPane: (pane: PaneInput) => void
    bringPaneToFront: (id: string) => void
    setActivePane: (id: string) => void
}

const PANE_OFFSET = 45 // Offset for new panes when tiling

const initialChatsPane: Pane = {
    id: 'chats',
    title: 'Chats',
    x: 0,
    y: 0,
    width: 300,
    height: (typeof window !== 'undefined' ? window.innerHeight : 1080),
    type: 'chats',
    isActive: true
}

export const usePaneStore = create<PaneStore>()(
    persist(
        (set) => ({
            panes: [initialChatsPane],
            lastPanePosition: null,
            addPane: (newPane, isCommandKeyHeld) => set((state) => {
                const paneId = newPane.id || `thread-${Math.random().toString(36).substr(2, 9)}`;
                let updatedPanes: Pane[]
                let panePosition: { x: number; y: number; width: number; height: number }

                // Ensure Chats pane is always present and at the beginning
                const chatsPane = state.panes.find(pane => pane.id === 'chats') || initialChatsPane
                updatedPanes = [chatsPane, ...state.panes.filter(pane => pane.id !== 'chats')]

                const existingChatPanes = updatedPanes.filter(pane => pane.type === 'chat')
                const lastChatPane = existingChatPanes[existingChatPanes.length - 1]

                if (newPane.type === 'chat') {
                    if (isCommandKeyHeld && lastChatPane) {
                        // Tiling behavior: add a new pane with offset
                        panePosition = {
                            x: lastChatPane.x + PANE_OFFSET,
                            y: lastChatPane.y + PANE_OFFSET,
                            width: lastChatPane.width,
                            height: lastChatPane.height
                        }
                        updatedPanes = updatedPanes.map(pane => ({ ...pane, isActive: false }))
                    } else if (existingChatPanes.length === 0) {
                        // First chat pane: take up most of the screen
                        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
                        const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
                        panePosition = {
                            x: 300, // Leave space for Chats pane
                            y: screenHeight * 0.1,
                            width: screenWidth - 300,
                            height: screenHeight * 0.8
                        }
                    } else {
                        // Replace existing chat pane
                        panePosition = {
                            x: lastChatPane.x,
                            y: lastChatPane.y,
                            width: lastChatPane.width,
                            height: lastChatPane.height
                        }
                        updatedPanes = updatedPanes.filter(pane => pane.type !== 'chat')
                    }

                    // Ensure the new pane is within the viewport
                    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
                    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
                    const maxX = screenWidth - panePosition.width
                    const maxY = screenHeight - panePosition.height
                    panePosition = {
                        x: Math.min(Math.max(panePosition.x, 0), maxX),
                        y: Math.min(Math.max(panePosition.y, 0), maxY),
                        width: panePosition.width,
                        height: panePosition.height
                    }

                    const newPaneWithPosition: Pane = {
                        ...newPane,
                        id: paneId,
                        ...panePosition,
                        isActive: true
                    }

                    updatedPanes.push(newPaneWithPosition)
                } else {
                    // For non-chat panes, use the provided position or a default
                    panePosition = newPane.paneProps || {
                        x: 100,
                        y: 100,
                        width: 400,
                        height: 300
                    }
                    updatedPanes.push({
                        ...newPane,
                        id: paneId,
                        ...panePosition,
                        isActive: true
                    })
                }

                return {
                    panes: updatedPanes,
                    lastPanePosition: panePosition
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
            openChatPane: (newPane) => set((state) => {
                const lastActivePane = state.panes.find(pane => pane.isActive) || state.panes[state.panes.length - 1]
                const panePosition = lastActivePane || state.lastPanePosition || {
                    x: (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2 - 400,
                    y: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.1,
                    width: 800,
                    height: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.8
                }

                const paneId = newPane.id || `thread-${Math.random().toString(36).substr(2, 9)}`

                const newPaneWithPosition: Pane = {
                    ...newPane,
                    x: panePosition.x,
                    y: panePosition.y,
                    width: panePosition.width,
                    height: panePosition.height,
                    isActive: true,
                    id: paneId,
                    type: 'chat',
                    title: newPane.title === 'Untitled' ? `Untitled thread #${paneId}` : newPane.title
                }
                return {
                    panes: [
                        state.panes.find(pane => pane.id === 'chats') || initialChatsPane,
                        newPaneWithPosition
                    ],
                    lastPanePosition: panePosition
                }
            }),
            bringPaneToFront: (id) => set((state) => {
                const paneToMove = state.panes.find(pane => pane.id === id)
                if (!paneToMove) return state
                return {
                    panes: [
                        state.panes.find(pane => pane.id === 'chats') || initialChatsPane,
                        ...state.panes.filter(pane => pane.id !== id && pane.id !== 'chats').map(pane => ({ ...pane, isActive: false })),
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
            name: 'openagents-pane-storage',
            partialize: (state) => ({ panes: state.panes, lastPanePosition: state.lastPanePosition }),
        }
    )
)