import { Pane } from '@/types/pane'
import { PANE_OFFSET } from '../constants'

export function handleChatPanePosition(existingPanes: Pane[]): { x: number; y: number; width: number; height: number } {
  const chatPanes = existingPanes.filter(pane => pane.type === 'chat');
  
  if (chatPanes.length === 0) {
    // First chat pane, make it take up most of the screen
    return {
      x: 50,
      y: 50,
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.8
    };
  } else if (chatPanes.length === 1) {
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