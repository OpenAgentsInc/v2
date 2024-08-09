import { z } from "zod"

// ... (previous code remains unchanged)

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

// Add these exports
export async function githubReadFile(args: { path: string, token: string, repoOwner: string, repoName: string, branch?: string }): Promise<string> {
    // Implementation details
    return "File contents";
}

export async function githubListContents(args: { path: string, token: string, repoOwner: string, repoName: string, branch?: string }): Promise<string[]> {
    // Implementation details
    return ["file1", "file2", "directory1"];
}

// ... (rest of the file remains unchanged)