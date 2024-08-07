# Pull Request Flow

The #1 objective of the OpenAgents v2 project is to enable a developer to produce production-ready code as fast as possible. A key part of this process is efficiently managing pull requests and code changes through an LLM-powered chat interface.

## Dashboard Components

The developer has a dashboard consisting of a few components:

- Sidebar - left 1/5 of the screen
  - Collapsible 
  - Contains:
    - List of chats
- Chat - middle 2/5 of the screen
  - Not collapsible
- Workspace - right 2/5 of the screen
  - Collapsible
  - Top: List of relevant files, found via Greptile search

## Existing Tools

Our current toolset includes:

1. `list_repos`: Lists the most recent repositories for the authenticated user.
2. `scrape_webpage`: Scrapes a webpage using Firecrawl and returns the content in markdown format.
3. `view_file`: Views file contents at a specified path.
4. `view_hierarchy`: Views file/folder hierarchy at a specified path (one level deep).

## New Tools to Implement

To fully support pull request management and code changes through the LLM chat interface, we need to implement the following tools:

### Pull Request Management
1. `list_pull_requests`: Lists open pull requests for the current repository.
2. `view_pull_request`: Shows details of a specific pull request, including title, description, and changed files.
3. `create_pull_request`: Creates a new pull request with specified title, description, and branch.
4. `update_pull_request`: Allows updating an existing pull request's title, description, or other metadata.
5. `merge_pull_request`: Merges a specified pull request if it's ready.
6. `comment_on_pull_request`: Adds a comment to a specific pull request.
7. `review_pull_request`: Submits a review (approve, request changes, or comment) on a pull request.
8. `list_pull_request_comments`: Lists all comments on a specific pull request.
9. `view_pull_request_diff`: Shows the diff for a specific pull request.

### File and Code Management
10. `create_file`: Creates a new file with specified content at a given path.
11. `edit_file`: Modifies the content of an existing file.
12. `delete_file`: Removes a file from the repository.
13. `create_patch`: Generates a patch file for changes made to one or more files.
14. `apply_patch`: Applies a patch file to the current branch.
15. `create_branch`: Creates a new branch in the repository.
16. `switch_branch`: Switches the current working branch.
17. `commit_changes`: Commits changes made to files in the current branch.

## Integration and Workflow

These tools will work together to provide a seamless pull request and code management experience:

1. The user initiates a conversation about code changes or pull requests in the chat interface.

2. For new features or bug fixes, the LLM can use `create_branch` to start a new line of development.

3. The LLM can make code changes using `create_file`, `edit_file`, or `delete_file` based on the user's requirements.

4. Changes can be committed using `commit_changes`.

5. If needed, the LLM can generate patches using `create_patch` or apply existing patches with `apply_patch`.

6. Once changes are ready, the LLM can create a pull request using `create_pull_request`.

7. The user can review open pull requests using `list_pull_requests` and `view_pull_request`.

8. The LLM can provide detailed diff information using `view_pull_request_diff`.

9. Reviews and comments can be added using `review_pull_request` and `comment_on_pull_request`.

10. If updates are needed, the LLM can make further changes and update the pull request using `update_pull_request`.

11. When a PR is ready and approved, the user can ask to merge it, triggering `merge_pull_request`.

12. Throughout this process, `view_file` and `view_hierarchy` can be used to provide context about the codebase.

13. If external information is needed, `scrape_webpage` can be used to gather relevant documentation or references.

## Implementation Details

To implement these new tools:

1. Create new files in the `tools/` directory for each of these functions, similar to existing tools like `list-repos.ts` or `view-file.ts`.

2. Update `tools/index.ts` to include these new tools in the `getTools` function.

3. Implement the necessary GitHub API calls in these new tool files. For file operations, you may need to use the Git Data API in addition to the Pull Requests API.

4. Update the `ToolContext` interface in `@/types` to include any additional properties needed for these operations, such as the current branch.

5. Modify `lib/hooks/use-chat.ts` to handle these new tools, possibly by extending the `onToolCall` function.

6. Update the system prompt in `lib/systemPrompt.ts` to include information about these new code and pull request-related tools.

7. Implement proper error handling and validation for each tool to ensure robustness.

8. Add appropriate permissions checks to ensure the user has the right access levels for each operation.

9. Consider implementing a local file system cache to improve performance for file-related operations.

10. Develop unit and integration tests for each new tool to ensure reliability.

By implementing these tools and integrating them into the chat interface, we'll enable the LLM to manage the entire pull request workflow and make code changes directly, significantly speeding up the development process.
