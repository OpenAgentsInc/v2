import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { BotCard } from '@/components/stocks'
import { listContents } from '@/lib/github/actions/listContents'
import { Repo } from '@/lib/types'
import { User } from '@clerk/nextjs/server'
import { isGitHubUser, getGitHubToken } from '@/lib/github/isGitHubUser'

export const viewHierarchy = (aiState: any, user: User | null, repo: Repo | null) => ({
    description: 'View file/folder hierarchy at path (one level deep)',
    parameters: z.object({
        path: z.string().describe('The path to view the hierarchy'),
        ref: z.string().optional().describe('The branch or commit reference (optional)')
    }),
    generate: async function*({ path, ref }: any) {
        yield (
            <BotCard>
                <div>Loading hierarchy...</div>
            </BotCard>
        )

        if (!repo) {
            return (
                <BotCard>
                    <div>Error: Repository information is not available.</div>
                </BotCard>
            )
        }

        const gitHubUser = !!user ? isGitHubUser(user) : false
        let gitHubToken = gitHubUser && !!user ? await getGitHubToken(user) : undefined

        try {
            const repoString = `${repo.owner}/${repo.name}`
            const contents = await listContents(repoString, path, ref || repo.branch, gitHubToken)
            const result = contents.map(item => `- ${item.name} (${item.type})`).join('\n')
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
                                toolName: 'viewHierarchy',
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
                                toolName: 'viewHierarchy',
                                toolCallId,
                                result: { contents: result, path }
                            }
                        ]
                    }
                ]
            })

            return (
                <BotCard>
                    <div>
                        <h3>File/Folder Hierarchy at {path}</h3>
                        <pre>{result}</pre>
                    </div>
                </BotCard>
            )
        } catch (error) {
            console.error('Error fetching hierarchy:', error)
            return (
                <BotCard>
                    <div>Error: Unable to fetch hierarchy. Please check the path and try again.</div>
                </BotCard>
            )
        }
    }
})
