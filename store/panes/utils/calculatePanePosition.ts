import { PANE_OFFSET } from '../constants'

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