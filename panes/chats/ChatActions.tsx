'use client'

import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { IconShare, IconSpinner, IconTrash } from "@/components/ui/icons"
import {
  Tooltip, TooltipContent, TooltipTrigger
} from "@/components/ui/tooltip"
import { ServerActionResult } from "@/types"
import { ChatShareDialog } from "./ChatShareDialog"
import { useChatActions } from "./useChatActions"

interface ChatActionsProps {
  chatId: string
  title: string
  messageCount: number
  removeChat: (args: { id: string }) => Promise<ServerActionResult<void>>
}

export function ChatActions({
  chatId,
  title,
  messageCount,
  removeChat
}: ChatActionsProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()
  const { handleShare, handleCopyShareLink, handleShareTwitter, isDeleting } = useChatActions()

  const handleRemoveChat = React.useCallback(async () => {
    startRemoveTransition(async () => {
      const result = await removeChat({
        id: chatId
      })

      if (result.success === false) {
        toast.error(result.error)
        return
      }

      setDeleteDialogOpen(false)
      toast.success('Chat deleted')
    })
  }, [chatId, removeChat, router])

  const handleShareClick = () => {
    setShareDialogOpen(true)
  }

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false)
  }

  return (
    <>
      <div className="flex space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="size-7 p-1 bg-black hover:bg-muted"
              onClick={handleShareClick}
            >
              <IconShare className="pl-1" />
              <span className="sr-only">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share chat</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="size-7 p-1 bg-black hover:bg-muted"
              disabled={isDeleting}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete chat</TooltipContent>
        </Tooltip>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="z-[10150]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your chat message and remove your
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={event => {
                event.preventDefault()
                handleRemoveChat()
              }}
            >
              {isDeleting && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ChatShareDialog
        open={shareDialogOpen}
        onOpenChange={handleCloseShareDialog}
        chatId={chatId}
        title={title}
        messageCount={messageCount}
        onShare={handleShare}
        onCopyLink={handleCopyShareLink}
        onShareTwitter={handleShareTwitter}
      />
    </>
  )
}
