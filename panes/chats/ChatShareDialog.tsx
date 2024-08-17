'use client'

import * as React from 'react'
import { type DialogProps } from '@radix-ui/react-dialog'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { IconSpinner } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'

interface ChatShareDialogProps extends DialogProps {
  chatId: string
  title: string
  messageCount: number
  onShare: (chatId: string) => Promise<boolean>
  onCopyLink: (chatId: string) => Promise<void>
  onShareTwitter: (chatId: string) => Promise<void>
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
      toast.success('Share link copied to clipboard')
    })
  }, [chatId, onShare, onCopyLink])

  const handleTwitterShare = React.useCallback(async () => {
    await onShareTwitter(chatId)
  }, [chatId, onShareTwitter])

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link to chat</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view the shared chat.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 space-y-1 text-sm border rounded-md">
          <div className="font-medium">{title}</div>
          <div className="text-muted-foreground">
            {messageCount} messages
          </div>
        </div>
        <DialogFooter className="items-center">
          <Button
            disabled={isSharePending}
            onClick={handleShare}
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
          >
            Share on Twitter
          </Button>
        </DialogFooter>
        <DialogDescription>
          Anyone who signs up after clicking your link will give you $5 of credit.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}