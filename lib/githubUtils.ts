import { z } from "zod"

const githubListContentsArgsSchema = z.object({
    path: z.string().optional().default(""),
    token: z.string(),
    repoOwner: z.string(),
    repoName: z.string(),
    branch: z.string().optional()
});

export async function githubListContents(args: z.infer<typeof githubListContentsArgsSchema>): Promise<string[]> {
    const { path, token, repoOwner, repoName, branch } = githubListContentsArgsSchema.parse(args);
    const cleanPath = path.replace(/^\//, '');
    let url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${cleanPath}`;
    if (branch) {
        url += `?ref=${branch}`;
    }

    const data = await githubApiRequest(url, token);

    if (Array.isArray(data)) {
        return data.map((item) => item.name);
    } else if (typeof data === 'object' && data !== null) {
        return [data.name];
    } else {
        throw new Error("Unexpected data format received from GitHub API");
    }
}

const githubReadFileArgsSchema = z.object({
    path: z.string(),
    token: z.string(),
    repoOwner: z.string(),
    repoName: z.string(),
    branch: z.string().optional()
});

export async function githubReadFile(args: z.infer<typeof githubReadFileArgsSchema>): Promise<string> {
    const { path, token, repoOwner, repoName, branch } = githubReadFileArgsSchema.parse(args);
    let url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
    if (branch) {
        url += `?ref=${branch}`;
    }

    const data = await githubApiRequest(url, token);

    if (typeof data !== 'object' || data === null || data.type !== "file") {
        throw new Error("The specified path is not a file");
    }

    return Buffer.from(data.content, 'base64').toString('utf-8');
}

export async function githubApiRequest(url: string, token: string, method: string = 'GET', body?: any) {
    try {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `token ${token}`,
                "User-Agent": "OpenAgents-App",
                "Content-Type": "application/json",
                "Accept": "application/vnd.github+json"
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

        if (!response.ok) {
            const error = new Error(`GitHub API request failed: ${response.statusText}`);
            (error as any).status = response.status;
            (error as any).data = responseData;
            throw error;
        }

        return responseData;
    } catch (error) {
        throw error;
    }
}

const githubListUserReposArgsSchema = z.object({
    token: z.string(),
    perPage: z.number().optional().default(30),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().default('pushed'),
    direction: z.enum(['asc', 'desc']).optional().default('desc'),
});

export async function githubListUserRepos(args: z.infer<typeof githubListUserReposArgsSchema>): Promise<any[]> {
    const { token, perPage, sort, direction } = githubListUserReposArgsSchema.parse(args);
    const url = `https://api.github.com/user/repos?${new URLSearchParams({
        per_page: perPage.toString(),
        sort,
        direction
    })}`;

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