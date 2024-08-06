import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { BotCard } from '@/components/stocks'
import { viewFileContents as fetchFileContents } from '@/lib/github/actions/viewFile'
import dynamic from 'next/dynamic'
import { Repo } from '@/lib/types'
import { User } from '@clerk/nextjs/server'
import { isGitHubUser, getGitHubToken } from '@/lib/github/isGitHubUser'

const DynamicFileViewer = dynamic(() => import('@/components/github/file-viewer').then(mod => mod.FileViewer), {
    ssr: false,
    loading: () => <div>Loading file viewer...</div>
});

export const viewFileContents = (aiState: any, user: User, repo: Repo | null) => ({
    description: 'View the contents of a file in the GitHub repository',
    parameters: z.object({
        path: z.string().describe('The file path within the repository'),
        ref: z.string().optional().describe('The branch or commit reference (optional)')
    }),
    generate: async function*({ path, ref }: any) {
        yield (
            <BotCard>
                <div>Loading file contents...</div>
            </BotCard>
        )

        if (!repo) {
            return (
                <BotCard>
                    <div>Error: Repository information is not available.</div>
                </BotCard>
            )
        }

        const gitHubUser = await isGitHubUser(user)
        console.log('GitHub user:', gitHubUser)
        let gitHubToken = gitHubUser ? await getGitHubToken(user) : null
        console.log('GitHub token:', gitHubToken)

        try {
            const repoString = `${repo.owner}/${repo.name}`
            const content = await fetchFileContents(repoString, path, ref || repo.branch, gitHubToken)
            const toolCallId = nanoid()

            aiState.done({
                ...aiState.get(),
                messages: [
                    ...aiState.get().messages,
                    {
                        id: nanoid(),
                        role: 'assistant',
                        content: [
                            {
                                type: 'tool-call',
                                toolName: 'viewFileContents',
                                toolCallId,
                                args: { repo: repoString, path, ref: ref || repo.branch }
                            }
                        ]
                    },
                    {
                        id: nanoid(),
                        role: 'tool',
                        content: [
                            {
                                type: 'tool-result',
                                toolName: 'viewFileContents',
                                toolCallId,
                                result: { content, path }
                            }
                        ]
                    }
                ]
            })

            return (
                <BotCard>
                    <DynamicFileViewer content={content} filename={path} />
                </BotCard>
            )
        } catch (error) {
            console.error('Error fetching file contents:', error)
            return (
                <BotCard>
                    <div>Error: Unable to fetch file contents. Please check the file path and try again.</div>
                </BotCard>
            )
        }
    }
})
