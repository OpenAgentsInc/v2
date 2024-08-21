# Inngest chat refactor

We were previously using the useChat hook from the Vercel AI SDK, which was nice but tethered the user chat to the browser session. If user clicked away it would terminate the flow. We are refactoring this to use background jobs via Inngest.

Here is the new flow:
- Any React component or function can trigger the `sendMessage()` server action. That does this:
  - Gets the user object, first ensuring the user is authed
  - Saves the message to the thread in Convex database (async via Inngest function?)
  - Gathers needed context (async...?)
  - Gathers needed tools
  - Sends context & prompt to LLM
- ...
- Agent can opt to wait a certain amount of time before continuing/retrying, or wait for user input
