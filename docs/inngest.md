# Inngest Chat Refactor

We are refactoring our chat system to use background jobs via Inngest, replacing the previous implementation that used the useChat hook from the Vercel AI SDK. This change will decouple the chat flow from the browser session, allowing for more robust and persistent chat experiences.

## New Chat Flow

1. User Interaction
   - Any React component or function can trigger the `sendMessage()` server action.

2. Server Action: `sendMessage()`
   a. User Authentication
      - Ensure the user is authenticated using Clerk

   b. Inngest Event Triggering
      - Trigger an Inngest event for message processing

   c. Return initial response to the client
      - Provide an acknowledgment or initial response to maintain UI responsiveness

3. Inngest Event Handler: `processMessage`
   a. Message Persistence
      - Save the user's message to the thread in the Convex database

   b. Context Gathering
      - Retrieve relevant context from the Convex database (e.g., thread history, user preferences)
      - Fetch any additional context required for processing the message

   c. Tool Preparation
      - Identify and prepare necessary tools for the AI agent based on the message content

   d. LLM Interaction
      - Construct the prompt using the gathered context and user message
      - Send the context and prompt to the Language Model

   e. Response Processing
      - Receive the LLM's response
      - Parse and process the response, executing any required actions

   f. Response Persistence
      - Save the AI's response to the thread in the Convex database

4. Client-Side Updates
   - Listen for real-time updates from Convex and display new messages in the UI
   - Handle any required UI changes based on the AI's response

5. Continuation and Retry Logic
   - Implement logic for the AI agent to:
     - Wait for a specified amount of time before continuing or retrying
     - Wait for user input if required
   - Use Inngest's scheduling capabilities for delayed actions or retries

## Implementation Details

1. Inngest Setup
   - Install Inngest: `npm install inngest`
   - Configure Inngest in the project (create `inngest/client.ts`)
   - Set up Inngest functions for message processing and any other background tasks

2. Database Updates
   - Modify the Convex schema to accommodate new fields for Inngest job tracking:
     - Add `inngestJobId` field to the `messages` table
     - Add `status` field to the `messages` table (e.g., 'pending', 'processing', 'completed', 'failed')

3. Server-Side Changes
   - Implement the `sendMessage()` server action:
     - Create `lib/chat/sendMessage.ts` for the server action
     - Use Clerk for user authentication
     - Trigger Inngest event for message processing
   - Create Inngest event handlers for message processing:
     - Implement `processMessage` function in `inngest/functions/processMessage.ts`
   - Develop utility functions for context gathering and tool preparation

4. Client-Side Updates
   - Modify the chat UI to work with the new asynchronous flow:
     - Update `panes/chat/ChatPane.tsx` to handle asynchronous message updates
   - Implement real-time updates using Convex's real-time capabilities

5. Error Handling and Monitoring
   - Implement robust error handling in Inngest functions
   - Set up monitoring and logging for background jobs:
     - Use Inngest's built-in monitoring features
     - Implement custom logging in Convex functions

## Next Steps

1. Refine the `processMessage` function in `inngest/functions/processMessage.ts`:
   - Implement more sophisticated AI processing logic
   - Add error handling and retries for each step
   - Implement context gathering and tool preparation steps

2. Enhance the `sendMessage` server action in `lib/chat/sendMessage.ts`:
   - Add input validation and sanitization
   - Implement rate limiting to prevent abuse

3. Update the Convex schema:
   - Add new fields for Inngest job tracking
   - Create new queries and mutations for the updated schema

4. Modify the client-side chat components:
   - Update chat UI components to handle asynchronous updates
   - Implement real-time updates using Convex subscriptions

5. Implement error handling and monitoring:
   - Set up error handling in Inngest functions
   - Configure logging and monitoring for the new system

## Refactored `sendMessage` Function

The `sendMessage` function has been refactored into separate files for better modularity and maintainability:

1. `lib/chat/authenticateUser.ts`: Handles user authentication using Clerk.
2. `lib/chat/triggerInngestEvent.ts`: Triggers the Inngest event for message processing.
3. `lib/chat/sendMessage.ts`: The main function that coordinates the message sending process.

This refactoring allows for easier testing, maintenance, and potential reuse of the authentication and event triggering logic in other parts of the application.
