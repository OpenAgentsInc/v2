import { Pane, PaneInput, HudStore } from './types'
import { calculatePanePosition, adjustPanePosition, createNewPaneWithPosition, PANE_OFFSET } from './paneUtils'
import { Id } from '../convex/_generated/dataModel'

export function addPane(set: (fn: (state: HudStore) => Partial<HudStore>) => void, newPane: PaneInput, shouldTile = false) {
  return set((state) => {
    const paneId = newPane.id || Math.random().toString(36).substr(2, 9);
    let updatedPanes: Pane[]
    let panePosition

    const existingPane = state.panes.find(pane => pane.id === paneId)
    if (existingPane) {
      updatedPanes = state.panes.map(pane => ({
        ...pane,
        isActive: pane.id === paneId
      }))
      return {
        panes: updatedPanes,
        isChatOpen: true,
        lastPanePosition: { x: existingPane.x, y: existingPane.y, width: existingPane.width, height: existingPane.height }
      }
    }

    if (shouldTile) {
      const lastPane = state.panes[state.panes.length - 1]
      panePosition = lastPane ? {
        x: lastPane.x + PANE_OFFSET,
        y: lastPane.y + PANE_OFFSET,
        width: lastPane.width,
        height: lastPane.height
      } : calculatePanePosition(state.panes.length)
      updatedPanes = state.panes.map(pane => ({ ...pane, isActive: false }))
    } else {
      const lastActivePane = state.panes.find(pane => pane.isActive) || state.panes[state.panes.length - 1]
      panePosition = lastActivePane || calculatePanePosition(0)
      updatedPanes = []
    }

    const adjustedPosition = adjustPanePosition(panePosition)
    const newPaneWithPosition = createNewPaneWithPosition(newPane, paneId as Id<"threads">, adjustedPosition)

    return {
      panes: [...updatedPanes.map(pane => ({ ...pane, isActive: false })), newPaneWithPosition],
      isChatOpen: true,
      lastPanePosition: adjustedPosition
    }
  })
}

export function removePane(set: (fn: (state: HudStore) => Partial<HudStore>) => void, id: Pane['id']) {
  return set((state) => {
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
  })
}

export function updatePanePosition(set: (fn: (state: HudStore) => Partial<HudStore>) => void, id: Pane['id'], x: number, y: number) {
  return set((state) => {
    const updatedPane = state.panes.find(pane => pane.id === id)
    return {
      panes: state.panes.map(pane =>
        pane.id === id ? { ...pane, x, y } : pane
      ),
      lastPanePosition: updatedPane ? { ...updatedPane, x, y } : state.lastPanePosition
    }
  })
}

export function updatePaneSize(set: (fn: (state: HudStore) => Partial<HudStore>) => void, id: Pane['id'], width: number, height: number) {
  return set((state) => {
    const updatedPane = state.panes.find(pane => pane.id === id)
    return {
      panes: state.panes.map(pane =>
        pane.id === id ? { ...pane, width, height } : pane
      ),
      lastPanePosition: updatedPane ? { ...updatedPane, width, height } : state.lastPanePosition
    }
  })
}

export function openChatPane(set: (fn: (state: HudStore) => Partial<HudStore>) => void, newPane: PaneInput) {
  return set((state) => {
    const lastActivePane = state.panes.find(pane => pane.isActive) || state.panes[state.panes.length - 1]
    const panePosition = lastActivePane || state.lastPanePosition || calculatePanePosition(0)

    const paneId = newPane.id || Math.random().toString(36).substr(2, 9);

    const newPaneWithPosition: Pane = {
      ...newPane,
      x: panePosition.x,
      y: panePosition.y,
      width: panePosition.width,
      height: panePosition.height,
      isActive: true,
      id: paneId as Id<"threads">,
      type: 'chat',
      title: newPane.title === 'Untitled' ? `Untitled thread #${paneId}` : newPane.title
    }
    return {
      panes: [newPaneWithPosition],
      isChatOpen: true,
      lastPanePosition: panePosition
    }
  })
}

export function bringPaneToFront(set: (fn: (state: HudStore) => Partial<HudStore>) => void, id: Pane['id']) {
  return set((state) => {
    const paneToMove = state.panes.find(pane => pane.id === id)
    if (!paneToMove) return state
    return {
      panes: [
        ...state.panes.filter(pane => pane.id !== id).map(pane => ({ ...pane, isActive: false })),
        { ...paneToMove, isActive: true }
      ],
      lastPanePosition: { x: paneToMove.x, y: paneToMove.y, width: paneToMove.width, height: paneToMove.height }
    }
  })
}

export function setActivePane(set: (fn: (state: HudStore) => Partial<HudStore>) => void, id: Pane['id']) {
  return set((state) => ({
    panes: state.panes.map(pane => ({
      ...pane,
      isActive: pane.id === id
    }))
  }))
}