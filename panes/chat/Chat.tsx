"use client"
import { InputBar } from "@/components/input/InputBar"
import { Id } from "@/convex/_generated/dataModel"
import { useChat } from "@/hooks/useChat"
import { useChatScroll } from "@/hooks/useChatScroll"
import { Message } from "@/types"
import { ChatList } from "./ChatList"
import { useCallback, useEffect } from "react"

export interface ChatProps extends React.ComponentProps<'div'> {
  threadId: Id<"threads">
}

export const Chat = ({ threadId, className }: ChatProps) => {
  const handleTitleUpdate = useCallback((chatId: string) => {
    console.log('Title updated for chat:', chatId);
    // You might want to trigger a re-render of the chat list or update the UI in some way
  }, []);

  const {
    messages,
    sendMessage,
    isLoading,
    threadData
  } = useChat({ propsId: threadId, onTitleUpdate: handleTitleUpdate })
  const chatContainerRef = useChatScroll(messages);

  useEffect(() => {
    console.log('Chat component received new threadId:', threadId);
  }, [threadId]);

  useEffect(() => {
    console.log('Chat component threadData updated:', threadData);
  }, [threadData]);

  return (
    <div className={`bg-transparent hover:bg-black hover:bg-opacity-100 transition-all duration-300 ease-in-out flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-auto" ref={chatContainerRef}>
        <ChatList messages={messages as Message[]} />
      </div>
      <div className="flex-shrink-0 w-full">
        <div className="sticky bottom-0 w-full">
          <InputBar onSubmit={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}