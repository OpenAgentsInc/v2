import { PaneStore, SetFunction } from '../types'

export function bringPaneToFront(set: SetFunction, id: string) {
  return set((state: PaneStore) => {
    const paneToMove = state.panes.find(pane => pane.id === id)
    if (!paneToMove) return state

    // Deactivate all panes and activate the one being brought to front
    const updatedPanes = [
      ...state.panes.filter(pane => pane.id !== id).map(pane => ({ ...pane, isActive: false })),
      { ...paneToMove, isActive: true }
    ]

    return {
      panes: updatedPanes,
      lastPanePosition: { x: paneToMove.x, y: paneToMove.y, width: paneToMove.width, height: paneToMove.height }
    }
  })
}