import { PaneStore, SetFunction } from '../types'

export function removePane(set: SetFunction, id: string) {
  return set((state: PaneStore) => {
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