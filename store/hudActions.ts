import { Pane, PaneInput } from '@/types/pane'
import { PaneStore } from './types'
import { calculatePanePosition, adjustPanePosition, createNewPaneWithPosition, PANE_OFFSET } from './paneUtils'
import { Id } from '../convex/_generated/dataModel'

export function addPane(set: (fn: (state: PaneStore) => Partial<PaneStore>) => void, newPane: PaneInput, shouldTile = false) {
  return set((state) => {
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

export function removePane(set: (fn: (state: PaneStore) => Partial<PaneStore>) => void, id: string) {
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

export function updatePanePosition(set: (fn: (state: PaneStore) => Partial<PaneStore>) => void, id: string, x: number, y: number) {
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

export function updatePaneSize(set: (fn: (state: PaneStore) => Partial<PaneStore>) => void, id: string, width: number, height: number) {
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

export function openChatPane(set: (fn: (state: PaneStore) => Partial<PaneStore>) => void, newPane: PaneInput, isCommandKeyHeld: boolean = false) {
  return set((state) => {
    if (!newPane.id) {
      console.error('Invalid thread ID provided for chat pane');
      return state;
    }

    const chatPanes = state.panes.filter(pane => pane.type === 'chat');
    let panePosition;

    if (chatPanes.length === 0) {
      // First chat pane, make it take up most of the screen
      panePosition = {
        x: 50,
        y: 50,
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8
      };
    } else if (chatPanes.length === 1 && !isCommandKeyHeld) {
      // Replace the existing chat pane
      panePosition = {
        x: chatPanes[0].x,
        y: chatPanes[0].y,
        width: chatPanes[0].width,
        height: chatPanes[0].height
      };
    } else {
      // Tile the new pane with an offset
      const lastPane = state.panes[state.panes.length - 1];
      panePosition = {
        x: lastPane.x + PANE_OFFSET,
        y: lastPane.y + PANE_OFFSET,
        width: lastPane.width,
        height: lastPane.height
      };
    }

    const newPaneWithPosition: Pane = {
      ...newPane,
      ...panePosition,
      isActive: true,
      id: newPane.id,
      type: 'chat',
      title: newPane.title === 'Untitled' ? `Untitled thread #${state.panes.length + 1}` : newPane.title
    };

    let updatedPanes;
    if (chatPanes.length === 1 && !isCommandKeyHeld) {
      // Replace the existing chat pane
      updatedPanes = state.panes.map(pane => 
        pane.type === 'chat' ? newPaneWithPosition : { ...pane, isActive: false }
      );
    } else {
      // Add the new pane and deactivate others
      updatedPanes = [
        ...state.panes.map(pane => ({ ...pane, isActive: false })),
        newPaneWithPosition
      ];
    }

    return {
      panes: updatedPanes,
      isChatOpen: true,
      lastPanePosition: panePosition
    };
  });
}

export function bringPaneToFront(set: (fn: (state: PaneStore) => Partial<PaneStore>) => void, id: string) {
  return set((state) => {
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

export function setActivePane(set: (fn: (state: PaneStore) => Partial<PaneStore>) => void, id: string) {
  return set((state) => ({
    panes: state.panes.map(pane => ({
      ...pane,
      isActive: pane.id === id
    }))
  }))
}