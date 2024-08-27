import { Octokit } from '@octokit/rest';
import { getGitHubToken } from '../lib/github';

export async function listPullRequests({ owner, repo }: { owner: string; repo: string }) {
  const octokit = new Octokit({ auth: getGitHubToken() });

  try {
    const response = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
      sort: 'created',
      direction: 'desc',
    });

    const pullRequests = response.data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      created_at: pr.created_at,
      user: pr.user?.login,
    }));

    return {
      success: true,
      pullRequests,
      summary: `Listed ${pullRequests.length} open pull requests for ${owner}/${repo}`,
      details: `Successfully retrieved open pull requests for ${owner}/${repo}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to list pull requests: ${error.message}`,
      summary: `Error listing pull requests for ${owner}/${repo}`,
      details: `An error occurred while trying to list pull requests for ${owner}/${repo}: ${error.message}`,
    };
  }
}