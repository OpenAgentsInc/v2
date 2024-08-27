import { Octokit } from '@octokit/rest'
import { getGitHubToken } from '../lib/github'

export async function updatePullRequest({
  owner,
  repo,
  pull_number,
  title,
  body,
}: {
  owner: string
  repo: string
  pull_number: number
  title?: string
  body?: string
}) {
  const octokit = new Octokit({ auth: getGitHubToken() })

  try {
    const response = await octokit.pulls.update({
      owner,
      repo,
      pull_number,
      title,
      body,
    })

    return {
      success: true,
      data: response.data,
      message: `Pull request #${pull_number} updated successfully`,
    }
  } catch (error) {
    console.error('Error updating pull request:', error)
    return {
      success: false,
      error: `Failed to update pull request #${pull_number}`,
    }
  }
}