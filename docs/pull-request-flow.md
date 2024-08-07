# Pull Request Flow

The #1 objective of the OpenAgents v2 project is to enable a developer to produce production-ready code as fast as possible. A key part of this process is efficiently managing pull requests through an LLM-powered chat interface.

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

To fully support pull request management through the LLM chat interface, we need to implement the following tools:

1. `list_pull_requests`: Lists open pull requests for the current repository.
2. `view_pull_request`: Shows details of a specific pull request, including title, description, and changed files.
3. `create_pull_request`: Creates a new pull request with specified title, description, and branch.
4. `update_pull_request`: Allows updating an existing pull request's title, description, or other metadata.
5. `merge_pull_request`: Merges a specified pull request if it's ready.
6. `comment_on_pull_request`: Adds a comment to a specific pull request.
7. `review_pull_request`: Submits a review (approve, request changes, or comment) on a pull request.
8. `list_pull_request_comments`: Lists all comments on a specific pull request.
9. `view_pull_request_diff`: Shows the diff for a specific pull request.

## Integration and Workflow

These tools will work together to provide a seamless pull request management experience:

1. The user initiates a conversation about pull requests in the chat interface.

2. The LLM uses `list_pull_requests` to provide an overview of open PRs.

3. The user can then ask for more details about a specific PR, triggering `view_pull_request`.

4. If the user wants to see the changes, `view_pull_request_diff` is used.

5. The LLM can suggest comments or reviews based on the diff, using `comment_on_pull_request` or `review_pull_request`.

6. If changes are needed, the user can request updates using natural language, which the LLM translates into `update_pull_request` calls.

7. When a PR is ready, the user can ask to merge it, triggering `merge_pull_request`.

8. Throughout this process, `view_file` and `view_hierarchy` can be used to provide context about the codebase.

9. If external information is needed, `scrape_webpage` can be used to gather relevant documentation or references.

## Implementation Details

To implement these new tools:
