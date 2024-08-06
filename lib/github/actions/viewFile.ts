import { Octokit } from '@octokit/rest';

export async function viewFileContents(repo: string, path: string, ref: string, token?: string): Promise<string> {
    const octokit = new Octokit({ auth: token ?? process.env.GITHUB_TOKEN });
    const [owner, repoName] = repo.split('/');

    console.log("Here in viewFileConetnts with:", repo, path, ref)

    try {
        const response = await octokit.repos.getContent({
            owner,
            repo: repoName,
            path,
            ref,
        });

        if ('content' in response.data) {
            return Buffer.from(response.data.content, 'base64').toString('utf-8');
        } else {
            throw new Error('Not a file');
        }
    } catch (error) {
        console.error('Error fetching file contents:', error);
        throw error;
    }
}
