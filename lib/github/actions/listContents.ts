import { Octokit } from '@octokit/rest';

interface ContentItem {
    name: string;
    type: 'file' | 'dir' | 'symlink' | 'submodule';
    path: string;
}

export async function listContents(repo: string, path: string, ref: string, token: string | undefined): Promise<ContentItem[]> {
    const octokit = new Octokit({ auth: token ?? process.env.GITHUB_TOKEN });
    const [owner, repoName] = repo.split('/');
    console.log("Here in githubListContents with:", repo, path, ref);

    try {
        const response = await octokit.repos.getContent({
            owner,
            repo: repoName,
            path,
            ref,
        });

        if (Array.isArray(response.data)) {
            return response.data.map(item => ({
                name: item.name,
                type: item.type as 'file' | 'dir' | 'symlink' | 'submodule',
                path: item.path
            }));
        } else {
            throw new Error('Not a directory');
        }
    } catch (error) {
        console.error('Error fetching directory contents:', error);
        throw error;
    }
}
