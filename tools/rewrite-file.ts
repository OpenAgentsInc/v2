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
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  const isCode = ['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'java', 'c', 'cpp', 'go', 'rs'].includes(fileExtension || '');

  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const addedLines = newLines.length - oldLines.length;

  let description = '';

  if (isCode) {
    const functionsAdded = (newContent.match(/function\s+\w+/g) || []).length - (oldContent.match(/function\s+\w+/g) || []).length;
    const classesAdded = (newContent.match(/class\s+\w+/g) || []).length - (oldContent.match(/class\s+\w+/g) || []).length;

    if (functionsAdded > 0) {
      description += `Add ${functionsAdded} function${functionsAdded > 1 ? 's' : ''}. `;
    } else if (functionsAdded < 0) {
      description += `Remove ${Math.abs(functionsAdded)} function${Math.abs(functionsAdded) > 1 ? 's' : ''}. `;
    }

    if (classesAdded > 0) {
      description += `Add ${classesAdded} class${classesAdded > 1 ? 'es' : ''}. `;
    } else if (classesAdded < 0) {
      description += `Remove ${Math.abs(classesAdded)} class${Math.abs(classesAdded) > 1 ? 'es' : ''}. `;
    }

    if (addedLines > 0) {
      description += `Add ${addedLines} line${addedLines > 1 ? 's' : ''} of code. `;
    } else if (addedLines < 0) {
      description += `Remove ${Math.abs(addedLines)} line${Math.abs(addedLines) > 1 ? 's' : ''} of code. `;
    }
  } else {
    const oldWords = oldContent.split(/\s+/).length;
    const newWords = newContent.split(/\s+/).length;
    const diffWords = newWords - oldWords;

    if (diffWords > 0) {
      description += `Add ${diffWords} word${diffWords > 1 ? 's' : ''}. `;
    } else if (diffWords < 0) {
      description += `Remove ${Math.abs(diffWords)} word${Math.abs(diffWords) > 1 ? 's' : ''}. `;
    }
  }

  description = description.trim();

  if (description) {
    return `Update ${fileName}: ${description}`;
  } else {
    return `Update ${fileName} with minor changes`;
  }
}