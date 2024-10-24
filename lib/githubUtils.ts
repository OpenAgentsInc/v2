import { z } from "zod"
import { useRepoStore } from "@/store/repo"

async function githubApiRequest(url: string, token: string, method: string = 'GET', body?: any): Promise<any> {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return response.json();
}

const githubListUserReposArgsSchema = z.object({
  perPage: z.number().optional(),
  sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
});

export async function githubListUserRepos(args: z.infer<typeof githubListUserReposArgsSchema>): Promise<any[]> {
  const { perPage, sort, direction } = githubListUserReposArgsSchema.parse(args);
  const params = new URLSearchParams();

  if (perPage !== undefined) params.append('per_page', perPage.toString());
  if (sort !== undefined) params.append('sort', sort);
  if (direction !== undefined) params.append('direction', direction);

  const url = `https://api.github.com/user/repos?${params.toString()}`;

  const token = useRepoStore.getState().githubToken;
  if (!token) {
    throw new Error("GitHub token not set. Please set your GitHub token first.");
  }

  const data = await githubApiRequest(url, token);

  if (!Array.isArray(data)) {
    throw new Error("Unexpected data format received from GitHub API");
  }

  return data.map(repo => ({
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    private: repo.private,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
  }));
}

export async function githubReadFile(args: { path: string, repoOwner: string, repoName: string, branch?: string }): Promise<string> {
  const { path, repoOwner, repoName, branch } = args;
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}${branch ? `?ref=${branch}` : ''}`;

  const token = useRepoStore.getState().githubToken;
  if (!token) {
    throw new Error("GitHub token not set. Please set your GitHub token first.");
  }

  const data = await githubApiRequest(url, token);

  if (data.type !== 'file') {
    throw new Error('The path does not point to a file');
  }

  return Buffer.from(data.content, 'base64').toString('utf-8');
}

export async function githubListContents(args: { path: string, repoOwner: string, repoName: string, branch?: string }): Promise<string[]> {
  const { path, repoOwner, repoName, branch } = args;
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}${branch ? `?ref=${branch}` : ''}`;

  const token = useRepoStore.getState().githubToken;
  if (!token) {
    throw new Error("GitHub token not set. Please set your GitHub token first.");
  }

  const data = await githubApiRequest(url, token);

  if (!Array.isArray(data)) {
    throw new Error('The path does not point to a directory');
  }

  return data.map((item: any) => item.name);
}

export async function githubDeleteFile(args: {
  path: string,
  repoOwner: string,
  repoName: string,
  branch?: string,
  message?: string,
  committerName?: string,
  committerEmail?: string
}): Promise<void> {
  const {
    path,
    repoOwner,
    repoName,
    branch = 'main',
    message,
    committerName = "GitHub API",
    committerEmail = "noreply@github.com"
  } = args;

  const token = useRepoStore.getState().githubToken;
  if (!token) {
    throw new Error("GitHub token not set. Please set your GitHub token first.");
  }

  // Include the branch in the URL for both GET and DELETE requests
  const fileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;

  // First, get the current file to retrieve its SHA
  const fileData = await githubApiRequest(`${fileUrl}?ref=${branch}`, token);

  if (!fileData.sha) {
    throw new Error(`File not found: ${path} in branch ${branch}`);
  }

  // Prepare the request body
  const body = {
    message: message || `Delete ${path}`,
    committer: {
      name: committerName,
      email: committerEmail
    },
    sha: fileData.sha,
    branch: branch,
  };

  // Send DELETE request
  await githubApiRequest(fileUrl, token, 'DELETE', body);
}