import { Pane, PaneInput } from '@/types/pane'

export function createNewPaneWithPosition(newPane: PaneInput, paneId: string, panePosition: { x: number; y: number; width: number; height: number }): Pane {
  return {
    ...newPane,
    id: paneId,
    ...panePosition,
    isActive: true,
    title: newPane.title === 'Untitled' ? `Untitled thread #${paneId}` : newPane.title
  }
}