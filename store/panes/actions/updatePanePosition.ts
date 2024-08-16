import { PaneStore, SetFunction } from '../types'

export function updatePanePosition(set: SetFunction, id: string, x: number, y: number) {
  return set((state: PaneStore) => {
    const updatedPane = state.panes.find(pane => pane.id === id)
    return {
      panes: state.panes.map(pane =>
        pane.id === id ? { ...pane, x, y } : pane
      ),
      lastPanePosition: updatedPane ? { ...updatedPane, x, y } : state.lastPanePosition
    }
  })
}