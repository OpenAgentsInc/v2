export type Pane = {
  id: string
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
  id?: string;
  paneProps?: {
    x: number
    y: number
    width: number
    height: number
  }
}