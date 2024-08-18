import { Pane } from '@/types/pane'

export function ensureChatsPaneExists(panes: Pane[]): Pane[] {
  const chatsPaneIndex = panes.findIndex(pane => pane.type === 'chats');
  if (chatsPaneIndex === -1) {
    return [
      {
        id: 'chats',
        type: 'chats',
        title: 'Chats',
        x: 200,
        y: 220,
        width: 300,
        height: 400,
        dismissable: false,
        isActive: false,
      },
      ...panes
    ];
  }
  return panes;
}