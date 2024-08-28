"use client"

import { Pane, PaneInput } from "@/types/pane"
import { PaneStore, SetFunction } from "../types"
import { ensureChatsPaneExists } from "../utils/ensureChatsPaneExists"
import { handleChatPanePosition } from "../utils/handleChatPanePosition"

const PANE_OFFSET = 45 // Offset for new panes when tiling, matching the value in hud.ts

export function openChatPane(set: SetFunction, newPane: PaneInput, isCommandKeyHeld: boolean = false) {
  // Define default chat pane dimensions
  const DEFAULT_CHAT_PANE_WIDTH = 800;
  const DEFAULT_CHAT_PANE_HEIGHT = window.innerHeight * 0.9;

  return set((state: PaneStore) => {
    if (!newPane.id) {
      console.error('Invalid thread ID provided for chat pane');
      return state;
    }

    let updatedPanes = ensureChatsPaneExists([...state.panes]);
    const panePosition = handleChatPanePosition(updatedPanes);

    const newPaneWithPosition: Pane = {
      ...newPane,
      x: panePosition.x,
      y: panePosition.y,
      width: DEFAULT_CHAT_PANE_WIDTH,
      height: DEFAULT_CHAT_PANE_HEIGHT,
      isActive: true,
      id: newPane.id,
      type: 'chat',
      title: newPane.title || `Untitled thread #${updatedPanes.length}`
    };

    if (isCommandKeyHeld) {
      // Find the latest chat pane
      const latestChatPane = [...updatedPanes].reverse().find(pane => pane.type === 'chat');

      if (latestChatPane) {
        // Tile the new pane with an offset from the latest chat pane
        newPaneWithPosition.x = latestChatPane.x + PANE_OFFSET;
        newPaneWithPosition.y = latestChatPane.y + PANE_OFFSET;
      } else {
        // If no chat pane exists, use the default position with offset
        newPaneWithPosition.x = panePosition.x + PANE_OFFSET;
        newPaneWithPosition.y = panePosition.y + PANE_OFFSET;
      }

      // Add the new pane and deactivate others, but keep the Chats pane and changelog pane active
      updatedPanes = [
        ...updatedPanes.map(pane => ({ ...pane, isActive: pane.type === 'chats' || pane.type === 'changelog' })),
        newPaneWithPosition
      ];
    } else {
      // Replace the existing chat pane, but keep the Chats pane and changelog pane
      updatedPanes = updatedPanes.map(pane =>
        pane.type === 'chat' ? newPaneWithPosition :
          (pane.type === 'chats' || pane.type === 'changelog') ? { ...pane, isActive: true } :
            { ...pane, isActive: false }
      );

      // If there's no existing chat pane, add the new one
      if (!updatedPanes.some(pane => pane.type === 'chat')) {
        updatedPanes.push(newPaneWithPosition);
      }
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
      lastPanePosition: {
        x: newPaneWithPosition.x,
        y: newPaneWithPosition.y,
        width: newPaneWithPosition.width,
        height: newPaneWithPosition.height
      }
    };
  });
}
