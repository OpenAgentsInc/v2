import { PaneManager } from '@/panes/PaneManager'
import { SimpleGrid } from '@/components/ui/simple-grid'

export function HomeAuthed() {
  return (
    <div className="relative w-full h-full">
      <SimpleGrid />
      <PaneManager />
    </div>
  )
}