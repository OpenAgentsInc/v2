import { Octokit } from '@octokit/rest'
import { z } from 'zod'
import { ToolDefinition } from './tool'

const schema = z.object({
  pull_number: z.number(),
})

export const viewPullRequest: ToolDefinition<typeof schema> = {
  name: 'view_pull_request',
  description: 'View details of a specific pull request, including comments, commits, and diffs',
  schema,
  func: async ({ pull_number }, { gitHubToken }) => {
    const octokit = new Octokit({ auth: gitHubToken })

    try {
      const { data: pr } = await octokit.pulls.get({
        owner: 'openagentsinc',
        repo: 'v2',
        pull_number,
      })

      const { data: comments } = await octokit.pulls.listComments({
        owner: 'openagentsinc',
        repo: 'v2',
        pull_number,
      })

      const { data: commits } = await octokit.pulls.listCommits({
        owner: 'openagentsinc',
        repo: 'v2',
        pull_number,
      })

      const { data: files } = await octokit.pulls.listFiles({
        owner: 'openagentsinc',
        repo: 'v2',
        pull_number,
      })

      return {
        success: true,
        pr,
        comments,
        commits,
        files,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch pull request details: ${error.message}`,
      }
    }
  },
}