'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'

import { ServerActionResult, type Chat } from '@/types'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { IconSpinner, IconTrash } from '@/components/ui/icons'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'

interface SidebarActionsProps {
    chat: Chat
    removeChat: (args: { id: number; path: string }) => Promise<ServerActionResult<void>>
}

export function SidebarActions({
    chat,
    removeChat
}: SidebarActionsProps) {
    const router = useRouter()
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [isRemovePending, startRemoveTransition] = React.useTransition()

    const handleRemoveChat = React.useCallback(async () => {
        startRemoveTransition(async () => {
            const result = await removeChat({
                id: chat.id,
                path: chat.path
            })

            if (result.success === false) {
                toast.error(result.error)
                return
            }

            setDeleteDialogOpen(false)
            router.refresh()
            router.push('/')
            toast.success('Chat deleted')
        })
    }, [chat.id, chat.path, removeChat, router])

    return (
        <>
            <div className="">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className="size-7 p-0 hover:bg-background"
                            disabled={isRemovePending}
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
                        <AlertDialogCancel disabled={isRemovePending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isRemovePending}
                            onClick={event => {
                                event.preventDefault()
                                handleRemoveChat()
                            }}
                        >
                            {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
