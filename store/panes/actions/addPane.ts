import { Pane, PaneInput } from '@/types/pane'
import { PaneStore, SetFunction } from '../types'
import { calculatePanePosition } from '../utils/calculatePanePosition'
import { adjustPanePosition } from '../utils/adjustPanePosition'
import { createNewPaneWithPosition } from '../utils/createNewPaneWithPosition'
import { PANE_OFFSET } from '../constants'

export function addPane(set: SetFunction, newPane: PaneInput, shouldTile = false) {
  return set((state: PaneStore) => {
    let updatedPanes: Pane[]
    let panePosition

    const existingPane = state.panes.find(pane => pane.id === newPane.id)
    if (existingPane) {
      updatedPanes = state.panes.map(pane => ({
        ...pane,
        isActive: pane.id === existingPane.id
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
    const newPaneWithPosition = createNewPaneWithPosition(newPane, newPane.id || '', adjustedPosition)

    return {
      panes: [...updatedPanes.map(pane => ({ ...pane, isActive: false })), newPaneWithPosition],
      isChatOpen: true,
      lastPanePosition: adjustedPosition
    }
  })
}