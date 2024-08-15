import { IconMessage, IconUsers } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarItemIconProps {
    sharePath?: string
}

export function SidebarItemIcon({ sharePath }: SidebarItemIconProps) {
    console.log('Rendering SidebarItemIcon, sharePath:', sharePath);

    return (
        <div className="absolute left-2 top-1 flex size-6 items-center justify-center">
            {sharePath ? (
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
    )
}