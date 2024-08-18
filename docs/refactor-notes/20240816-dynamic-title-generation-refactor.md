# Dynamic Title Generation Refactor

Date: 2024-08-16

## Objective

Adapt the dynamic title generation functionality to work with the new Convex system.

## Changes Made

1. Updated `convex/threads.ts`:
   - Added a new `generateTitle` mutation function that uses the Convex database and OpenAI to generate titles for chat threads.

2. Updated `hooks/useChat.ts`:
   - Modified the `useChat` hook to use the new `generateTitle` Convex mutation.

3. Updated `docs/systems/dynamic-titles.md`:
   - Revised the documentation to reflect the new implementation using Convex functions.

## Implementation Details

The new `generateTitle` function in `convex/threads.ts` does the following:
- Fetches messages for the given thread from the Convex database.
- Formats the messages for the OpenAI API.
- Uses the OpenAI API to generate a title.
- Updates the thread's metadata with the new title.

The `useChat` hook now calls this function after receiving the first assistant message in a thread.

## Deployment Steps

To implement these changes:
1. Save all modifications to Convex functions, especially in `convex/threads.ts`.
2. Deploy the updated Convex functions using `npx convex deploy`.
3. Restart the development server with `npm run dev`.

## Potential Issues and Solutions

If you encounter the error "Could not find public function for 'threads:generateTitle'", it's likely because the Convex functions haven't been deployed after making changes. Always run `npx convex deploy` after modifying Convex functions.

## Future Improvements

1. Implement error handling and retries for title generation.
2. Add a way to manually trigger title regeneration.
3. Optimize the title generation process for longer conversations.
4. Consider caching generated titles to reduce API calls.

## Conclusion

This refactor successfully adapts the dynamic title generation feature to work with the Convex system, maintaining the functionality while integrating it with our new backend architecture.