import { PaneStore, SetFunction } from '../types'

export function setActivePane(set: SetFunction, id: string) {
  return set((state: PaneStore) => ({
    panes: state.panes.map(pane => ({
      ...pane,
      isActive: pane.id === id
    }))
  }))
}