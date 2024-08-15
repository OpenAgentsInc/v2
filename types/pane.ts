import { Id } from '@/convex/_generated/dataModel'

export type Pane = {
  id: Id<"threads"> | number
  title: string
  x: number
  y: number
  width: number
  height: number
  type: 'default' | 'chat' | 'diff'
  content?: {
    oldContent?: string
    newContent?: string
  }
  isActive?: boolean
}

export type PaneInput = Omit<Pane, 'x' | 'y' | 'width' | 'height' | 'id'> & {
  id?: Id<"threads"> | number;
  paneProps?: {
    x: number
    y: number
    width: number
    height: number
  }
}