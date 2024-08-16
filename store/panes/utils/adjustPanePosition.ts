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