interface UseChatProps {
  threadId: string
}

export function useChat({ threadId }: UseChatProps) {
  return {
    isLoading: false,
    messages: [],
    sendMessage: () => { }
  }
}
