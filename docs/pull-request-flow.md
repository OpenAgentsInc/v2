# Pull request flow

The #1 objective of the OpenAgents v2 project is to enable a developer to produce production-ready code as fast as possible.

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

## Tools we want to add
list_pull_requests: This tool would list open pull requests for the current repository.

view_pull_request: This tool would show details of a specific pull request, including title, description, and changed files.

create_pull_request: This tool would create a new pull request with specified title, description, and branch.

update_pull_request: This tool would allow updating an existing pull request's title, description, or other metadata.

merge_pull_request: This tool would merge a specified pull request if it's ready.

comment_on_pull_request: This tool would add a comment to a specific pull request.

review_pull_request: This tool would submit a review (approve, request changes, or comment) on a pull request.

list_pull_request_comments: This tool would list all comments on a specific pull request.

view_pull_request_diff: This tool would show the diff for a specific pull request.
