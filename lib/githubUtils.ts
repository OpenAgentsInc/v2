import { z } from "zod"

async function githubApiRequest(url: string, token: string): Promise<any> {
    const response = await fetch(url, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    return response.json();
}

const githubListUserReposArgsSchema = z.object({
    token: z.string(),
    perPage: z.number().optional(),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional(),
    direction: z.enum(['asc', 'desc']).optional(),
});

export async function githubListUserRepos(args: z.infer<typeof githubListUserReposArgsSchema>): Promise<any[]> {
    const { token, perPage, sort, direction } = githubListUserReposArgsSchema.parse(args);
    const params = new URLSearchParams();
    
    if (perPage !== undefined) params.append('per_page', perPage.toString());
    if (sort !== undefined) params.append('sort', sort);
    if (direction !== undefined) params.append('direction', direction);

    const url = `https://api.github.com/user/repos?${params.toString()}`;

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

export async function githubReadFile(args: { path: string, token: string, repoOwner: string, repoName: string, branch?: string }): Promise<string> {
    const { path, token, repoOwner, repoName, branch } = args;
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}${branch ? `?ref=${branch}` : ''}`;
    
    const data = await githubApiRequest(url, token);
    
    if (data.type !== 'file') {
        throw new Error('The path does not point to a file');
    }
    
    return Buffer.from(data.content, 'base64').toString('utf-8');
}

export async function githubListContents(args: { path: string, token: string, repoOwner: string, repoName: string, branch?: string }): Promise<string[]> {
    const { path, token, repoOwner, repoName, branch } = args;
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}${branch ? `?ref=${branch}` : ''}`;
    
    const data = await githubApiRequest(url, token);
    
    if (!Array.isArray(data)) {
        throw new Error('The path does not point to a directory');
    }
    
    return data.map((item: any) => item.name);
}

// ... (rest of the file remains unchanged)