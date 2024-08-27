import { Octokit } from '@octokit/rest'
import { getGitHubToken } from '../lib/github'

export async function closePullRequest({
  owner,
  repo,
  pull_number,
}: {
  owner: string
  repo: string
  pull_number: number
}) {
  const octokit = new Octokit({ auth: getGitHubToken() })

  try {
    const response = await octokit.pulls.update({
      owner,
      repo,
      pull_number,
      state: 'closed',
    })

    return {
      success: true,
      data: response.data,
      message: `Pull request #${pull_number} closed successfully`,
    }
  } catch (error) {
    console.error('Error closing pull request:', error)
    return {
      success: false,
      error: `Failed to close pull request #${pull_number}`,
    }
  }
}