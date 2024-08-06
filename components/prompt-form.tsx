'use client'
import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { useRouter } from 'next/navigation'
import { useRepoStore } from '@/store/repo'
import { useModelStore } from '@/store/models'

interface PromptFormProps {
    input: string
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function PromptForm({ input, handleInputChange, handleSubmit }: PromptFormProps) {
    const router = useRouter()
    const { formRef, onKeyDown } = useEnterSubmit()
    const inputRef = React.useRef<HTMLTextAreaElement>(null)
    const repo = useRepoStore((state) => state.repo)
    const model = useModelStore((state) => state.model)

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
        >
            <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
                            onClick={() => {
                                router.push('/new')
                            }}
                        >
                            <IconPlus />
                            <span className="sr-only">New Chat</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Chat</TooltipContent>
                </Tooltip>
                <Textarea
                    ref={inputRef}
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                    placeholder="Send a message."
                    className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    name="message"
                    rows={1}
                    value={input}
                    onChange={handleInputChange}
                />
                <div className="absolute right-0 top-[13px] sm:right-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="submit" size="icon" disabled={input === ''}>
                                <IconArrowElbow />
                                <span className="sr-only">Send message</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </form>
    )
}
