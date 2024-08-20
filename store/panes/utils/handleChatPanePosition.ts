"use client"

import { Pane } from "@/types/pane"
import { PANE_OFFSET } from "../constants"

export function handleChatPanePosition(existingPanes: Pane[]): { x: number; y: number; width: number; height: number } {
  const chatPanes = existingPanes.filter(pane => pane.type === 'chat');

  if (chatPanes.length === 0) {
    // First chat pane, set dimensions as requested
    return {
      x: (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2 - 300,
      y: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.05,
      width: 800,
      height: (typeof window !== 'undefined' ? window.innerHeight : 1080) * 0.9,
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
