# Chat Actions in lib/chat/actions.tsx

[Previous content remains unchanged]

## GitHub Integration Plan

The stock-related components in the current implementation are for demonstration purposes only. We are now planning to replace them with tools and components for interacting with a GitHub repository via the GitHub API. This section outlines the specification and implementation plan for this new feature set.

### Objectives

1. Replace stock-related tools with GitHub-specific tools
2. Enable users to interact with GitHub repositories through the chat interface
3. Implement a modular and extensible architecture for easy future additions

### Proposed Tools and Components

1. View File Contents
2. View File/Folder Hierarchy
3. Create File
4. Open Pull Request
5. Merge Pull Request
6. List Repositories
7. View Branch Information
8. Create Issue
9. Comment on Issue/PR

### Implementation Plan

We'll refactor the existing `actions.tsx` file into separate files and folders for better organization and maintainability. Here's the proposed structure:

```
lib/
  github/
    actions/
      viewFile.ts
      viewHierarchy.ts
      createFile.ts
      pullRequests.ts
      issues.ts
      repositories.ts
    components/
      FileViewer.tsx
      HierarchyViewer.tsx
      PullRequestCreator.tsx
      PullRequestMerger.tsx
      IssueCreator.tsx
    types.ts
    utils.ts
  chat/
    actions.tsx (refactored)
```

#### Detailed Specifications

1. **View File Contents** (`lib/github/actions/viewFile.ts`)
   ```typescript
   async function viewFileContents(repo: string, path: string, ref?: string): Promise<string>
   ```
   - Fetches and returns the contents of a file from a specified repository and path
   - Optional `ref` parameter to specify branch or commit

2. **View File/Folder Hierarchy** (`lib/github/actions/viewHierarchy.ts`)
   ```typescript
   async function viewHierarchy(repo: string, path: string, ref?: string): Promise<HierarchyItem[]>
   ```
   - Returns an array of items (files and folders) at the specified path
   - Each item includes name, type (file/folder), and path

3. **Create File** (`lib/github/actions/createFile.ts`)
   ```typescript
   async function createFile(repo: string, path: string, content: string, message: string): Promise<CreateFileResult>
   ```
   - Creates a new file in the specified repository and path
   - Returns information about the created file and the commit

4. **Open Pull Request** (`lib/github/actions/pullRequests.ts`)
   ```typescript
   async function openPullRequest(repo: string, title: string, body: string, head: string, base: string): Promise<PullRequest>
   ```
   - Opens a new pull request with the specified details
   - Returns the created pull request object

5. **Merge Pull Request** (`lib/github/actions/pullRequests.ts`)
   ```typescript
   async function mergePullRequest(repo: string, pullNumber: number, commitMessage?: string): Promise<MergeResult>
   ```
   - Merges the specified pull request
   - Returns the result of the merge operation

6. **List Repositories** (`lib/github/actions/repositories.ts`)
   ```typescript
   async function listRepositories(username: string, page: number = 1, perPage: number = 30): Promise<Repository[]>
   ```
   - Lists repositories for the specified user
   - Supports pagination

7. **View Branch Information** (`lib/github/actions/repositories.ts`)
   ```typescript
   async function getBranchInfo(repo: string, branch: string): Promise<BranchInfo>
   ```
   - Retrieves information about a specific branch in a repository

8. **Create Issue** (`lib/github/actions/issues.ts`)
   ```typescript
   async function createIssue(repo: string, title: string, body: string, labels?: string[]): Promise<Issue>
   ```
   - Creates a new issue in the specified repository
   - Optionally assigns labels to the issue

9. **Comment on Issue/PR** (`lib/github/actions/issues.ts`)
   ```typescript
   async function addComment(repo: string, issueNumber: number, body: string): Promise<Comment>
   ```
   - Adds a comment to an issue or pull request

### UI Components

1. **FileViewer** (`lib/github/components/FileViewer.tsx`)
   - Displays file contents with syntax highlighting
   - Supports different file types (e.g., markdown, code)

2. **HierarchyViewer** (`lib/github/components/HierarchyViewer.tsx`)
   - Shows file/folder structure in a tree-like view
   - Allows navigation through the hierarchy

3. **PullRequestCreator** (`lib/github/components/PullRequestCreator.tsx`)
   - Form for creating new pull requests
   - Includes fields for title, description, source and target branches

4. **PullRequestMerger** (`lib/github/components/PullRequestMerger.tsx`)
   - Interface for reviewing and merging pull requests
   - Shows diff, allows adding comments, and merging

5. **IssueCreator** (`lib/github/components/IssueCreator.tsx`)
   - Form for creating new issues
   - Includes fields for title, description, and labels

### Integration with Chat Actions

The `lib/chat/actions.tsx` file will be refactored to use these new GitHub-related tools and components. The `submitUserMessage` function will be updated to recognize GitHub-related queries and use the appropriate tools.

Example integration:

```typescript
// In lib/chat/actions.tsx

import { viewFileContents, viewHierarchy, createFile, openPullRequest, mergePullRequest } from '../github/actions';
import { FileViewer, HierarchyViewer, PullRequestCreator, PullRequestMerger } from '../github/components';

// ... existing code ...

const tools = {
  viewFile: {
    description: 'View the contents of a file in a GitHub repository',
    parameters: z.object({
      repo: z.string().describe('The repository name'),
      path: z.string().describe('The file path'),
      ref: z.string().optional().describe('The branch or commit reference')
    }),
    generate: async function*({ repo, path, ref }) {
      const content = await viewFileContents(repo, path, ref);
      return <FileViewer content={content} />;
    }
  },
  // ... other tool definitions ...
};

// ... rest of the file ...
```

### Next Steps

1. Implement the core GitHub API integration functions in the `actions` folder
2. Develop UI components for displaying GitHub data and interactions
3. Update the chat AI model to understand and respond to GitHub-related queries
4. Refactor `lib/chat/actions.tsx` to incorporate the new GitHub tools
5. Add error handling and edge cases for GitHub API interactions
6. Implement user authentication and authorization for GitHub actions
7. Create comprehensive documentation for the new GitHub integration features

By following this plan, we'll create a powerful interface for interacting with GitHub repositories directly through the chat UI, enhancing the functionality and usefulness of our AI chatbot application.