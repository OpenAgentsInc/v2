import { Pane, PaneInput } from '@/types/pane'
import { PaneStore } from './types'
import { calculatePanePosition, adjustPanePosition, createNewPaneWithPosition, PANE_OFFSET } from './paneUtils'
import { Id } from '../convex/_generated/dataModel'

// ... (keep other existing functions)

function ensureChatsPaneExists(panes: Pane[]): Pane[] {
  const chatsPaneIndex = panes.findIndex(pane => pane.type === 'chats');
  if (chatsPaneIndex === -1) {
    return [
      {
        id: 'chats',
        type: 'chats',
        title: 'Chats',
        x: 200,
        y: 220,
        width: 300,
        height: 400,
        isOpen: true,
        dismissable: false,
        isActive: false,
      },
      ...panes
    ];
  }
  return panes;
}

function handleChatPanePosition(existingPanes: Pane[], isCommandKeyHeld: boolean): { x: number; y: number; width: number; height: number } {
  const chatPanes = existingPanes.filter(pane => pane.type === 'chat');
  
  if (chatPanes.length === 0) {
    // First chat pane, make it take up most of the screen
    return {
      x: 50,
      y: 50,
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.8
    };
  } else if (chatPanes.length === 1 && !isCommandKeyHeld) {
    // Replace the existing chat pane
    return {
      x: chatPanes[0].x,
      y: chatPanes[0].y,
      width: chatPanes[0].width,
      height: chatPanes[0].height
    };
  } else {
    // Tile the new pane with an offset
    const lastPane = existingPanes[existingPanes.length - 1];
    return {
      x: lastPane.x + PANE_OFFSET,
      y: lastPane.y + PANE_OFFSET,
      width: lastPane.width,
      height: lastPane.height
    };
  }
}

export function openChatPane(set: (fn: (state: PaneStore) => Partial<PaneStore>) => void, newPane: PaneInput, isCommandKeyHeld: boolean = false) {
  return set((state) => {
    if (!newPane.id) {
      console.error('Invalid thread ID provided for chat pane');
      return state;
    }

    let updatedPanes = ensureChatsPaneExists([...state.panes]);
    const panePosition = handleChatPanePosition(updatedPanes, isCommandKeyHeld);

    const newPaneWithPosition: Pane = {
      ...newPane,
      ...panePosition,
      isActive: true,
      id: newPane.id,
      type: 'chat',
      title: newPane.title || `Untitled thread #${updatedPanes.length}`
    };

    if (updatedPanes.length > 1 && !isCommandKeyHeld) {
      // Replace the existing chat pane, but keep the Chats pane
      updatedPanes = updatedPanes.map(pane => 
        pane.type === 'chat' ? newPaneWithPosition : { ...pane, isActive: false }
      );
    } else {
      // Add the new pane and deactivate others, but keep the Chats pane
      updatedPanes = [
        ...updatedPanes.map(pane => ({ ...pane, isActive: false })),
        newPaneWithPosition
      ];
    }

    // Ensure the Chats pane is always at the beginning of the array
    const chatsPaneIndex = updatedPanes.findIndex(pane => pane.type === 'chats');
    if (chatsPaneIndex > 0) {
      const chatsPane = updatedPanes.splice(chatsPaneIndex, 1)[0];
      updatedPanes.unshift(chatsPane);
    }

    return {
      panes: updatedPanes,
      isChatOpen: true,
      lastPanePosition: panePosition
    };
  });
}

// ... (keep other existing functions)