import React from 'react'
import { cn } from '@/lib/utils'
import { Wrench, Github, GitBranch } from 'lucide-react'
import { useRepoStore } from '@/store/repo'

export function FooterText({ className, ...props }: React.ComponentProps<'div'>) {
    const repo = useRepoStore((state) => state.repo)

    return (
        <div
            className={cn(
                'px-2 text-center text-xs leading-normal text-muted-foreground',
                className
            )}
            {...props}
        >
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                    <button className="bg-black text-white hover:bg-white/10 rounded px-2 py-1 flex items-center space-x-1">
                        <span className="opacity-75 text-xs">Claude 3.5 Sonnet</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                    </button>
                    <span className="bg-black text-white rounded-full px-2 py-0.5 text-xs flex items-center opacity-75">
                        <Wrench className="mr-1" size={14} />
                        4
                    </span>
                    {repo && (
                        <>
                            <span className="bg-black text-white rounded-full px-2 py-0.5 text-xs flex items-center opacity-75">
                                <Github className="mr-1" size={14} />
                                {repo.owner}/{repo.name}
                            </span>
                            <span className="bg-black text-white rounded-full px-2 py-0.5 text-xs flex items-center opacity-75">
                                <GitBranch className="mr-1" size={14} />
                                {repo.branch}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}