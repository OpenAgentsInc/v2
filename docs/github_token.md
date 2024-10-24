# GitHub Token Handling in OpenAgents

This document explains how GitHub tokens are handled in the OpenAgents application, including the process of manual token setting and fallback mechanisms.

## Overview

OpenAgents uses GitHub tokens to authenticate API requests to GitHub, allowing users to interact with repositories, issues, and pull requests. The application supports two methods of obtaining a GitHub token:

1. Manually set by the user
2. Automatically retrieved from the user's Clerk account (if connected to GitHub)

## Token Retrieval Process

The token retrieval process follows this order:

1. Check for a manually set token
2. If no manual token is found, attempt to retrieve the token from the user's Clerk account
3. If no token is available from either source, the application will handle the absence of a token gracefully

## Implementation Details

### Manual Token Setting

Users can manually set their GitHub token through the `GitHubTokenInput` component. This token is stored in the application's state using the `useRepoStore` from `store/repo.ts`.

### Token Retrieval in `getToolContext`

The `getToolContext` function in `tools/index.ts` is responsible for assembling the context used by various tools in the application. It handles GitHub token retrieval as follows:

```typescript
export const getToolContext = async (body: ToolContextBody): Promise<ToolContext> => {
  // ... other context setup ...

  // Use the manually set token if available, otherwise fall back to the Clerk user's token
  let finalGitHubToken = githubToken;
  if (!finalGitHubToken && user) {
    finalGitHubToken = await getGitHubToken(user);
  }

  return {
    // ... other context properties ...
    gitHubToken: finalGitHubToken,
  };
};
```

### Clerk Token Retrieval

If no manual token is set, the application attempts to retrieve the GitHub token from the user's Clerk account. This is done in the `getGitHubToken` function in `lib/github/isGitHubUser.ts`:

```typescript
export async function getGitHubToken(user: User) {
  const tokenResponse = await clerkClient().users.getUserOauthAccessToken(user.id, 'oauth_github');
  if (tokenResponse.data.length > 0) {
    return tokenResponse.data[0].token;
  } else {
    console.log("No GitHub token found for user:", user.id);
    return undefined;
  }
}
```

## Usage in Tools

Individual tools that require GitHub authentication use the `gitHubToken` from the provided context. For example, in `tools/view-file.ts`:

```typescript
if (!context.gitHubToken) {
  return {
    success: false,
    error: "Missing GitHub token",
    summary: "Failed to view file due to missing GitHub token",
    details: "The GitHub token is missing. Please ensure it is provided in the context."
  };
}
```

## Handling Missing Tokens

If no GitHub token is available (either manually set or from Clerk), the tools are designed to handle this gracefully, typically by returning an error message indicating that the GitHub token is missing.

## Best Practices

1. Always check for the presence of a GitHub token before attempting to make GitHub API requests.
2. Provide clear feedback to the user if a GitHub token is required but not available.
3. Encourage users to either manually set their GitHub token or connect their GitHub account to their Clerk profile for seamless authentication.

## Troubleshooting

If you encounter issues with GitHub authentication:

1. Check if the user has manually set a GitHub token.
2. Verify if the user's Clerk account is connected to GitHub.
3. Ensure that the GitHub token has the necessary permissions for the required operations.
4. Check the console logs for any error messages related to token retrieval or GitHub API requests.

By following this token handling process, OpenAgents ensures a flexible and robust approach to GitHub authentication, accommodating both manual token entry and automated token retrieval through Clerk.