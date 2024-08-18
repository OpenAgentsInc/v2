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
  isUpdated: boolean // New prop to indicate if the title has been updated
}

export function ChatItem({ index, chat, children, isNew, isUpdated }: ChatItemProps) {
  const { panes } = usePaneStore()
  const openChatPane = useOpenChatPane()
  const isActive = panes.some(pane => pane.type === 'chat' && pane.id === chat.id && pane.isActive)
  const isOpen = panes.some(pane => pane.type === 'chat' && pane.id === chat.id)
  const [shouldAnimate, setShouldAnimate] = React.useState(isNew || isUpdated)
  const [prevTitle, setPrevTitle] = React.useState(chat.title)
  const [isHovered, setIsHovered] = React.useState(false)

  React.useEffect(() => {
    if (isNew || isUpdated || chat.title !== prevTitle) {
      setShouldAnimate(true);
      setPrevTitle(chat.title);
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 5000); // Reset after 5 seconds
      return () => clearTimeout(timer);
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
          height: 0,
          opacity: 0
        },
        animate: {
          height: 'auto',
          opacity: 1
        }
      }}
      initial={shouldAnimate ? 'initial' : false}
      animate={shouldAnimate ? 'animate' : false}
      transition={{
        duration: 0.25,
        ease: 'easeIn'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
            {chat.title}
          </span>
        </div>
      </button>
      {(isActive || isHovered) && <div className="absolute right-2 top-1">{children}</div>}
    </motion.div >
  )
}
