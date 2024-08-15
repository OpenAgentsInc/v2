import { motion } from 'framer-motion'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarItemButtonProps {
    onClick: (e: React.MouseEvent) => void
    isOpen: boolean
    isActive: boolean
    title: string
    shouldAnimate: boolean
}

export function SidebarItemButton({ onClick, isOpen, isActive, title, shouldAnimate }: SidebarItemButtonProps) {
    console.log('Rendering SidebarItemButton', { isOpen, isActive, title, shouldAnimate });

    return (
        <button
            onClick={onClick}
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
                title={title}
            >
                <span className="whitespace-nowrap">
                    {shouldAnimate ? (
                        title.split('').map((character, index) => (
                            <motion.span
                                key={index}
                                variants={{
                                    initial: {
                                        opacity: 0,
                                        x: -100
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
                                    ease: 'easeIn',
                                    delay: index * 0.05,
                                    staggerChildren: 0.05
                                }}
                            >
                                {character}
                            </motion.span>
                        ))
                    ) : (
                        <span>{title}</span>
                    )}
                </span>
            </div>
        </button>
    )
}