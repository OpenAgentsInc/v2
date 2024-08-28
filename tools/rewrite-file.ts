import { CoreTool, tool } from "ai"
import { z } from "zod"
import { ToolContext } from "@/types"
import { Octokit } from "@octokit/rest"
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

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
        const commitMessage = await generateCommitMessage(path, currentContent, content);

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

async function generateCommitMessage(path: string, oldContent: string, newContent: string): Promise<string> {
  const fileName = path.split('/').pop() || path;
  const prompt = `
    Generate a concise commit message (max 50 words) for the following file change:
    
    File: ${fileName}
    
    Old content:
    ${oldContent.slice(0, 500)}...
    
    New content:
    ${newContent.slice(0, 500)}...
    
    Focus on describing the main changes and their purpose. Start with an action verb.
  `;

  try {
    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      prompt,
      maxTokens: 100,
      temperature: 0.7,
    });

    // Ensure the commit message is not longer than 50 words
    const words = text.split(' ');
    if (words.length > 50) {
      return words.slice(0, 47).join(' ') + '...';
    }

    return text.trim();
  } catch (error) {
    console.error('Error generating commit message:', error);
    return `Update ${fileName}`;
  }
}