import { Pane, PaneInput } from '@/types/pane'

const PANE_OFFSET = 45 // Offset for new panes when tiling

export function calculatePanePosition(paneCount: number): { x: number; y: number; width: number; height: number } {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

  // Center the initial chat pane
  if (paneCount === 0) {
    return {
      x: screenWidth / 2 - 400,
      y: screenHeight * 0.1,
      width: 800,
      height: screenHeight * 0.8
    }
  }

  // For additional panes, use the offset logic
  return {
    x: screenWidth * 0.3 + (paneCount * PANE_OFFSET),
    y: 80 + (paneCount * PANE_OFFSET),
    width: screenWidth * 0.4,
    height: screenHeight * 0.8
  }
}

export function adjustPanePosition(panePosition: { x: number; y: number; width: number; height: number }): { x: number; y: number; width: number; height: number } {
  const maxX = (typeof window !== 'undefined' ? window.innerWidth : 1920) - panePosition.width
  const maxY = (typeof window !== 'undefined' ? window.innerHeight : 1080) - panePosition.height
  return {
    x: Math.min(Math.max(panePosition.x, 0), maxX),
    y: Math.min(Math.max(panePosition.y, 0), maxY),
    width: panePosition.width,
    height: panePosition.height
  }
}

export function createNewPaneWithPosition(newPane: PaneInput, paneId: string, panePosition: { x: number; y: number; width: number; height: number }): Pane {
  return {
    ...newPane,
    id: paneId,
    ...panePosition,
    isActive: true,
    title: newPane.title === 'Untitled' ? `Untitled thread #${paneId}` : newPane.title
  }
}

export { PANE_OFFSET }