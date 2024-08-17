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
import { useChatActions } from "./useChatActions"

interface ChatActionsProps {
  chatId: string
  removeChat: (args: { id: string }) => Promise<ServerActionResult<void>>
}

export function ChatActions({
  chatId,
  removeChat
}: ChatActionsProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()
  const { handleShare, handleCopyShareLink, handleShareTwitter, isDeleting } = useChatActions()
  const [shareLink, setShareLink] = React.useState("")

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
    const link = handleShare(chatId)
    setShareLink(link)
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
              className="size-7 p-0 hover:bg-background"
              onClick={handleShareClick}
            >
              <IconShare />
              <span className="sr-only">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share chat</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="size-7 p-0 hover:bg-background"
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
        <AlertDialogContent>
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
      <AlertDialog open={shareDialogOpen} onOpenChange={handleCloseShareDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Share this chat</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a share link that will let the public access current and future messages in this chat thread.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="break-all">Share link: {shareLink}</p>
            <p className="mt-2">Anyone who signs up after clicking your link will give you $5 of credit.</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseShareDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleShareTwitter(chatId)
                handleCloseShareDialog()
              }}
            >
              Share on Twitter
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleCopyShareLink(chatId)}
            >
              Copy Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}