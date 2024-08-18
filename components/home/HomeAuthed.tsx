import { PaneManager } from '@/panes/PaneManager'
import { SimpleGrid } from './SimpleGrid'

export function HomeAuthed() {
  return (
    <div className="relative w-full h-full">
      <SimpleGrid />
      <PaneManager />
    </div>
  )
}