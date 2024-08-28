import { CoreTool, tool } from "ai"
import { z } from "zod"
import { ToolContext } from "@/types"
import { Octokit } from "@octokit/rest"

const params = z.object({
  path: z.string().describe('The path of the file to rewrite'),
  content: z.string().describe('The new content to write to the file'),
  owner: z.string().optional().describe('The owner of the repository'),
  repo: z.string().optional().describe('The name of the repository'),
  branch: z.string().optional().describe('The branch to update'),
});

type Params = z.infer<typeof params>;

type Result = {
  success: boolean;
  summary: string;
  details: string;
  commitMessage: string;
  newContent: string;
  oldContent: string;
};

export const rewriteFileTool = (context: ToolContext): CoreTool<typeof params, Result> => tool({
  description: 'Rewrites the contents of a file at the given path',
  parameters: params,
  execute: async ({ path, content, owner, repo, branch }: Params): Promise<Result> => {
    if (!context.gitHubToken) {
      return {
        success: false,
        summary: 'Failed to rewrite file due to missing github token',
        details: 'The tool context is missing required repository information or GitHub token.',
        commitMessage: '',
        newContent: '',
        oldContent: '',
      };
    }

    const octokit = new Octokit({ auth: context.gitHubToken });

    const repoOwner = owner || context.repo.owner;
    const repoName = repo || context.repo.name;
    const repoBranch = branch || context.repo.branch;

    // If these are blank, we can't proceed
    if (!repoOwner || !repoName || !repoBranch) {
      return {
        success: false,
        summary: 'Failed to rewrite file due to missing repository information',
        details: 'The repository owner, name, or branch is missing from the context or parameters.',
        commitMessage: '',
        newContent: '',
        oldContent: '',
      };
    }

    try {
      // Get the current file to retrieve its SHA and content
      const { data: currentFile } = await octokit.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path,
        ref: repoBranch,
      });

      if ('sha' in currentFile && 'content' in currentFile) {
        const currentContent = Buffer.from(currentFile.content, 'base64').toString('utf-8');
        const commitMessage = generateCommitMessage(path, currentContent, content);

        // Update the file
        const { data } = await octokit.repos.createOrUpdateFileContents({
          owner: repoOwner,
          repo: repoName,
          path,
          message: commitMessage,
          content: Buffer.from(content).toString('base64'),
          sha: currentFile.sha,
          branch: repoBranch,
        });

        const summary = `Edited ${path.split('/').pop()} - ${commitMessage}`;

        return {
          success: true,
          summary,
          details: `File ${path} has been successfully updated in ${repoOwner}/${repoName} on branch ${repoBranch}. Commit SHA: ${data.commit.sha}`,
          commitMessage,
          newContent: content,
          oldContent: currentContent,
        };
      } else {
        throw new Error('Unable to retrieve file SHA or content');
      }
    } catch (error) {
      console.error('Error rewriting file:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        summary: 'Failed to rewrite file',
        details: `Error: ${errorMessage}`,
        commitMessage: '',
        newContent: '',
        oldContent: '',
      };
    }
  },
});

function generateCommitMessage(path: string, oldContent: string, newContent: string): string {
  const fileName = path.split('/').pop() || path;
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  
  const addedLines = newLines.filter(line => !oldLines.includes(line)).length;
  const removedLines = oldLines.filter(line => !newLines.includes(line)).length;
  
  let changes = [];
  if (addedLines > 0) changes.push(`added ${addedLines} line${addedLines > 1 ? 's' : ''}`);
  if (removedLines > 0) changes.push(`removed ${removedLines} line${removedLines > 1 ? 's' : ''}`);
  
  const changesDescription = changes.join(' and ');
  
  let commitMessage = `Update ${fileName}: ${changesDescription}`;
  
  // Analyze the changes to provide more context
  if (oldContent !== newContent) {
    if (oldContent.length === 0 && newContent.length > 0) {
      commitMessage += ". Created new file with initial content";
    } else if (oldContent.length > 0 && newContent.length === 0) {
      commitMessage += ". Removed all content from file";
    } else {
      const oldWords = oldContent.split(/\s+/);
      const newWords = newContent.split(/\s+/);
      const addedWords = newWords.filter(word => !oldWords.includes(word));
      const removedWords = oldWords.filter(word => !newWords.includes(word));
      
      if (addedWords.length > 0 || removedWords.length > 0) {
        commitMessage += ". Modified content";
        if (addedWords.length > 0) {
          commitMessage += `, added key terms: ${addedWords.slice(0, 3).join(', ')}`;
        }
        if (removedWords.length > 0) {
          commitMessage += `, removed key terms: ${removedWords.slice(0, 3).join(', ')}`;
        }
      }
    }
  }
  
  // Ensure the commit message is not longer than 50 words
  const words = commitMessage.split(' ');
  if (words.length > 50) {
    commitMessage = words.slice(0, 47).join(' ') + '...';
  }
  
  return commitMessage;
}