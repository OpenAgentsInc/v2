import { Octokit } from '@octokit/rest'
import { z } from 'zod'
import { ToolDefinition } from './tool'

const listOpenIssuesSchema = z.object({
  owner: z.string(),
  repo: z.string(),
})

export const listOpenIssuesTool: ToolDefinition = {
  name: 'list_open_issues',
  description: 'Lists open issues in a repository',
  parameters: listOpenIssuesSchema,
  execute: async (params, context) => {
    const { owner, repo } = listOpenIssuesSchema.parse(params)

    const octokit = new Octokit({ auth: context.gitHubToken })

    try {
      const response = await octokit.issues.listForRepo({
        owner,
        repo,
        state: 'open',
      })

      const issues = response.data.map((issue) => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        user: issue.user.login,
      }))

      return {
        success: true,
        message: `Successfully fetched ${issues.length} open issues`,
        issues,
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch open issues: ${error.message}`,
      }
    }
  },
}