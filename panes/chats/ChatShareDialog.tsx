'use client'

import * as React from 'react'
import { type DialogProps } from '@radix-ui/react-dialog'
import { toast } from 'sonner'

import { ServerActionResult, type Chat } from '@/lib/types'
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
  onShare: (id: string) => string
  onCopyLink: (id: string) => void
  onShareTwitter: (id: string) => void
}

export function ChatShareDialog({
  chatId,
  onShare,
  onCopyLink,
  onShareTwitter,
  ...props
}: ChatShareDialogProps) {
  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 })
  const [isSharePending, startShareTransition] = React.useTransition()

  const handleShare = React.useCallback(() => {
    startShareTransition(async () => {
      const shareLink = onShare(chatId)
      copyToClipboard(shareLink)
      onCopyLink(chatId)
      toast.success('Share link copied to clipboard')
    })
  }, [chatId, onShare, onCopyLink, copyToClipboard])

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this chat</DialogTitle>
          <DialogDescription>
            This will generate a share link that will let the public access current and future messages in this chat thread.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="items-center">
          <Button
            disabled={isSharePending}
            onClick={handleShare}
          >
            {isSharePending ? (
              <>
                <IconSpinner className="mr-2 animate-spin" />
                Generating link...
              </>
            ) : (
              <>Generate and copy link</>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onShareTwitter(chatId)}
          >
            Share on Twitter
          </Button>
        </DialogFooter>
        <p className="mt-2 text-sm text-muted-foreground">Anyone who signs up after clicking your link will give you $5 of credit.</p>
      </DialogContent>
    </Dialog>
  )
}