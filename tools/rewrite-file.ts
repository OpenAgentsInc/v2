import { z } from 'zod';
import { CoreTool } from 'ai';
import { Octokit } from '@octokit/rest';

const RepoContextSchema = z.object({
    owner: z.string(),
    name: z.string(),
    branch: z.string().optional(),
});

const RewriteFileParamsSchema = z.object({
    path: z.string().describe('The path of the file to rewrite'),
    content: z.string().describe('The new content to write to the file'),
    token: z.string().describe('GitHub access token'),
    repoContext: RepoContextSchema,
});

type RewriteFileParams = z.infer<typeof RewriteFileParamsSchema>;

interface RewriteFileResult {
    summary: string;
    details: string;
    commitMessage: string;
    newContent: string;
    oldContent: string;
}

export const rewriteFileTool: CoreTool<typeof RewriteFileParamsSchema, RewriteFileResult> = {
    description: 'Rewrites the contents of a file at the given path',
    parameters: RewriteFileParamsSchema,
    execute: async ({ path, content, token, repoContext }: RewriteFileParams) => {
        const octokit = new Octokit({ auth: token });

        try {
            // Get the current file to retrieve its SHA and content
            const { data: currentFile } = await octokit.repos.getContent({
                owner: repoContext.owner,
                repo: repoContext.name,
                path,
                ref: repoContext.branch,
            });

            if ('sha' in currentFile && 'content' in currentFile) {
                const currentContent = Buffer.from(currentFile.content, 'base64').toString('utf-8');
                const commitMessage = generateCommitMessage(path, currentContent, content);

                // Update the file
                const { data } = await octokit.repos.createOrUpdateFileContents({
                    owner: repoContext.owner,
                    repo: repoContext.name,
                    path,
                    message: commitMessage,
                    content: Buffer.from(content).toString('base64'),
                    sha: currentFile.sha,
                    branch: repoContext.branch,
                });

                const summary = `Edited ${path.split('/').pop()} - ${commitMessage}`;
                return {
                    summary,
                    details: `File ${path} has been successfully updated. Commit SHA: ${data.commit.sha}`,
                    commitMessage,
                    newContent: content,
                    oldContent: currentContent,
                };
            } else {
                throw new Error('Unable to retrieve file SHA or content');
            }
        } catch (error) {
            console.error('Error rewriting file:', error);
            throw new Error(`Failed to rewrite file: ${error}`);
        }
    },
};

function generateCommitMessage(path: string, oldContent: string, newContent: string): string {
    const fileExtension = path.split('.').pop()?.toLowerCase();
    const isCode = ['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'java', 'c', 'cpp', 'go', 'rs'].includes(fileExtension || '');

    if (isCode) {
        const addedLines = newContent.split('\n').length - oldContent.split('\n').length;
        const action = addedLines > 0 ? 'Add' : 'Remove';
        return `${action} ${Math.abs(addedLines)} lines in ${path.split('/').pop()}`;
    } else {
        const oldWords = oldContent.split(/\s+/).length;
        const newWords = newContent.split(/\s+/).length;
        const diffWords = newWords - oldWords;
        const action = diffWords > 0 ? 'Add' : 'Remove';
        return `${action} ${Math.abs(diffWords)} words in ${path.split('/').pop()}`;
    }
}