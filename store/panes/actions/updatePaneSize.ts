import { PaneStore, SetFunction } from '../types'

export function updatePaneSize(set: SetFunction, id: string, width: number, height: number) {
  return set((state: PaneStore) => {
    const updatedPane = state.panes.find(pane => pane.id === id)
    return {
      panes: state.panes.map(pane =>
        pane.id === id ? { ...pane, width, height } : pane
      ),
      lastPanePosition: updatedPane ? { ...updatedPane, width, height } : state.lastPanePosition
    }
  })
}