import { Pane, PaneInput } from '@/types/pane'
import { PaneStore, SetFunction } from '../types'
import { ensureChatsPaneExists } from '../utils/ensureChatsPaneExists'
import { handleChatPanePosition } from '../utils/handleChatPanePosition'

export function openChatPane(set: SetFunction, newPane: PaneInput) {
  return set((state: PaneStore) => {
    if (!newPane.id) {
      console.error('Invalid thread ID provided for chat pane');
      return state;
    }

    let updatedPanes = ensureChatsPaneExists([...state.panes]);
    const panePosition = handleChatPanePosition(updatedPanes);

    const newPaneWithPosition: Pane = {
      ...newPane,
      ...panePosition,
      isActive: true,
      id: newPane.id,
      type: 'chat',
      title: newPane.title || `Untitled thread #${updatedPanes.length}`
    };

    if (updatedPanes.length > 1) {
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