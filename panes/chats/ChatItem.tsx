'use client'

import { motion } from "framer-motion"
import * as React from "react"
import { buttonVariants } from "@/components/ui/button"
import { IconMessage, IconUsers } from "@/components/ui/icons"
import {
  Tooltip, TooltipContent, TooltipTrigger
} from "@/components/ui/tooltip"
import { useOpenChatPane } from "@/hooks/useOpenChatPane"
import { cn } from "@/lib/utils"
import { usePaneStore } from "@/store/pane"
import { Chat } from "@/types"
import { ChatActions } from "./ChatActions"

interface ChatItemProps {
  index: number
  chat: Chat
  isNew: boolean
  isUpdated: boolean
}

export function ChatItem({ index, chat, isNew, isUpdated }: ChatItemProps) {
  const { panes } = usePaneStore()
  const openChatPane = useOpenChatPane()
  const isActive = panes.some(pane => pane.type === 'chat' && pane.id === chat.id && pane.isActive)
  const isOpen = panes.some(pane => pane.type === 'chat' && pane.id === chat.id)
  const [shouldAnimate, setShouldAnimate] = React.useState(false)
  const [prevTitle, setPrevTitle] = React.useState(chat.title)
  const [isHovered, setIsHovered] = React.useState(false)

  React.useEffect(() => {
    if (isNew || isUpdated || chat.title !== prevTitle) {
      setPrevTitle(chat.title);
      const animationDelay = setTimeout(() => {
        setShouldAnimate(true);
      }, 50);
      const animationDuration = setTimeout(() => {
        setShouldAnimate(false);
      }, 5050);
      return () => {
        clearTimeout(animationDelay);
        clearTimeout(animationDuration);
      };
    }
  }, [chat.id, chat.title, isNew, isUpdated, prevTitle]);

  if (!chat?.id) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    openChatPane(chat.id, chat.title, e.metaKey || e.ctrlKey)
  }

  return (
    <motion.div
      className="relative"
      variants={{
        initial: { opacity: 1 },
        animate: { opacity: 1 }
      }}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.25, ease: 'easeIn' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'group w-full px-8 py-2 transition-colors hover:bg-white/10',
          isOpen && 'bg-zinc-200 dark:bg-zinc-800',
          (isActive || isHovered) && 'pr-24 font-semibold',
          'text-left relative'
        )}
      >
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center">
          {chat.sharePath ? (
            <Tooltip delayDuration={1000}>
              <TooltipTrigger
                tabIndex={-1}
                className="focus:bg-muted focus:ring-1 focus:ring-ring"
              >
                <IconUsers className="text-zinc-500" />
              </TooltipTrigger>
              <TooltipContent>This is a shared chat.</TooltipContent>
            </Tooltip>
          ) : (
            <IconMessage className="text-zinc-500" />
          )}
        </div>
        <div
          className="relative flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={chat.title}
        >
          <span className="whitespace-nowrap">
            {shouldAnimate ? (
              chat.title.split('').map((character, index) => (
                <motion.span
                  key={index}
                  variants={{
                    initial: { opacity: 0, x: -10 },
                    animate: { opacity: 1, x: 0 }
                  }}
                  initial="initial"
                  animate="animate"
                  transition={{
                    duration: 0.25,
                    ease: 'easeOut',
                    delay: index * 0.03
                  }}
                >
                  {character}
                </motion.span>
              ))
            ) : (
              <span>{chat.title}</span>
            )}
          </span>
        </div>
      </button>
      {(isActive || isHovered) && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <ChatActions chatId={chat.id} />
        </div>
      )}
    </motion.div>
  )
}