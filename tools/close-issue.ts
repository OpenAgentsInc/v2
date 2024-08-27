import { Octokit } from '@octokit/rest';
import { getGitHubToken } from '../lib/github';

export async function closeIssue(issueNumber: number) {
  const octokit = new Octokit({ auth: getGitHubToken() });
  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  const repo = process.env.GITHUB_REPOSITORY_NAME;

  if (!owner || !repo) {
    throw new Error('GitHub repository owner or name not set in environment variables');
  }

  try {
    const response = await octokit.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: 'closed'
    });

    return {
      success: true,
      message: `Issue #${issueNumber} closed successfully`,
      data: response.data
    };
  } catch (error) {
    console.error('Error closing issue:', error);
    return {
      success: false,
      message: `Failed to close issue #${issueNumber}`,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}