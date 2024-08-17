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

interface ChatItemProps {
  index: number
  chat: Chat
  children: React.ReactNode
  isNew: boolean
  isUpdated: boolean
}

export function ChatItem({ index, chat, children, isNew, isUpdated }: ChatItemProps) {
  const { panes } = usePaneStore()
  const openChatPane = useOpenChatPane()
  const isActive = panes.some(pane => pane.type === 'chat' && pane.id === chat.id && pane.isActive)
  const isOpen = panes.some(pane => pane.type === 'chat' && pane.id === chat.id)
  const [shouldAnimate, setShouldAnimate] = React.useState(false)
  const [prevTitle, setPrevTitle] = React.useState(chat.title)

  React.useEffect(() => {
    if (isNew || isUpdated || chat.title !== prevTitle) {
      setPrevTitle(chat.title);
      // Add a small delay before starting the animation
      const animationDelay = setTimeout(() => {
        setShouldAnimate(true);
      }, 50);
      const animationDuration = setTimeout(() => {
        setShouldAnimate(false);
      }, 5050); // 5000ms animation + 50ms delay
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
        initial: {
          height: 'auto',
          opacity: 1
        },
        animate: {
          height: 'auto',
          opacity: 1
        }
      }}
      initial="initial"
      animate="animate"
      transition={{
        duration: 0.25,
        ease: 'easeIn'
      }}
    >
      <div className="absolute left-2 top-1 flex size-6 items-center justify-center">
        {chat.sharePath ? (
          <Tooltip delayDuration={1000}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <IconUsers className="mr-2 mt-1 text-zinc-500" />
            </TooltipTrigger>
            <TooltipContent>This is a shared chat.</TooltipContent>
          </Tooltip>
        ) : (
          <IconMessage className="mr-2 mt-1 text-zinc-500" />
        )}
      </div>
      <button
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'group w-full px-8 transition-colors hover:bg-white/10',
          isOpen && 'bg-zinc-200 dark:bg-zinc-800',
          isActive && 'pr-16 font-semibold',
          'text-left'
        )}
      >
        <div
          className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={chat.title}
        >
          <span className="whitespace-nowrap">
            {shouldAnimate ? (
              chat.title.split('').map((character, index) => (
                <motion.span
                  key={index}
                  variants={{
                    initial: {
                      opacity: 0,
                      x: -10
                    },
                    animate: {
                      opacity: 1,
                      x: 0
                    }
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
      {isActive && <div className="absolute right-2 top-1">{children}</div>}
    </motion.div>
  )
}