'use client'

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { IconSpinner } from "@/components/ui/icons"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { DialogProps } from "@radix-ui/react-dialog"

interface ChatShareDialogProps extends DialogProps {
  chatId: string
  title: string
  messageCount: number
  onShare: (chatId: string) => Promise<boolean>
  onCopyLink: (chatId: string) => Promise<void>
  onShareTwitter: (chatId: string, title: string) => Promise<void>
}

export function ChatShareDialog({
  chatId,
  title,
  messageCount,
  onShare,
  onCopyLink,
  onShareTwitter,
  ...props
}: ChatShareDialogProps) {
  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 })
  const [isSharePending, startShareTransition] = React.useTransition()

  const handleShare = React.useCallback(async () => {
    startShareTransition(async () => {
      const success = await onShare(chatId)

      if (!success) {
        toast.error('Failed to share chat')
        return
      }

      await onCopyLink(chatId)
      // toast.success('Share link copied to clipboard')
    })
  }, [chatId, onShare, onCopyLink])

  const handleTwitterShare = React.useCallback(async () => {
    startShareTransition(async () => {
      const success = await onShare(chatId)

      if (!success) {
        toast.error('Failed to share chat')
        return
      }

      await onShareTwitter(chatId, title)
      toast.success('Shared on X (Twitter)')
    })
  }, [chatId, title, onShare, onShareTwitter])

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link to chat</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view the shared chat. You'll earn $5 of credit for anyone who joins OpenAgents after signing up through your link.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 space-y-1 text-sm border rounded-md">
          <div className="font-medium">{title}</div>
          <div className="text-muted-foreground">
            {messageCount} messages
          </div>
        </div>
        <DialogFooter className="flex flex-col items-center space-x-2">
          <Button
            disabled={isSharePending}
            onClick={handleShare}
            className="w-full max-w-xs"
          >
            {isSharePending ? (
              <>
                <IconSpinner className="mr-2 animate-spin" />
                Copying...
              </>
            ) : (
              <>Copy link</>
            )}
          </Button>
          <Button
            disabled={isSharePending}
            onClick={handleTwitterShare}
            className="w-full text-white max-w-xs bg-background border border-primary hover:bg-accent/50"
          >
            Share on X
          </Button>
        </DialogFooter>
        {/*
        <DialogDescription className="text-center mt-4">
          Anyone who signs up after clicking your link will give you $5 of credit.
        </DialogDescription>
        */}
      </DialogContent>
    </Dialog>
  )
}
