# Inngest Chat Refactor

We are refactoring our chat system to use background jobs via Inngest, replacing the previous implementation that used the useChat hook from the Vercel AI SDK. This change will decouple the chat flow from the browser session, allowing for more robust and persistent chat experiences.

## New Chat Flow

1. User Interaction
   - Any React component or function can trigger the `sendMessage()` server action.

2. Server Action: `sendMessage()`
   a. User Authentication
      - Ensure the user is authenticated using Clerk
      - Retrieve the user object from the Convex database
   
   b. Message Persistence
      - Save the user's message to the thread in the Convex database
      - Trigger an Inngest event for message processing
   
   c. Return initial response to the client
      - Provide an acknowledgment or initial response to maintain UI responsiveness

3. Inngest Event Handler: `processMessage`
   a. Context Gathering
      - Retrieve relevant context from the Convex database (e.g., thread history, user preferences)
      - Fetch any additional context required for processing the message
   
   b. Tool Preparation
      - Identify and prepare necessary tools for the AI agent based on the message content
   
   c. LLM Interaction
      - Construct the prompt using the gathered context and user message
      - Send the context and prompt to the Language Model
   
   d. Response Processing
      - Receive the LLM's response
      - Parse and process the response, executing any required actions
   
   e. Response Persistence
      - Save the AI's response to the thread in the Convex database
   
   f. Client Notification
      - Trigger a real-time update to the client using Convex's real-time capabilities

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
     - Replace the current implementation in `hooks/chat/useChatCore.ts`
     - Use Convex mutations to save the initial message
     - Trigger Inngest event for message processing
   - Create Inngest event handlers for message processing:
     - Implement `processMessage` function in a new file (e.g., `inngest/functions/processMessage.ts`)
   - Develop utility functions for context gathering and tool preparation:
     - Move relevant logic from `useChatCore.ts` to new utility files

4. Client-Side Updates
   - Modify the chat UI to work with the new asynchronous flow:
     - Update `panes/chat/ChatPane.tsx` to handle asynchronous message updates
   - Implement real-time updates using Convex's real-time capabilities:
     - Replace `useVercelChat` with Convex queries and subscriptions in `hooks/chat/useChatCore.ts`

5. Error Handling and Monitoring
   - Implement robust error handling in Inngest functions
   - Set up monitoring and logging for background jobs:
     - Use Inngest's built-in monitoring features
     - Implement custom logging in Convex functions

6. Testing
   - Develop unit tests for individual components:
     - Test Inngest functions
     - Test Convex mutations and queries
   - Create integration tests for the entire chat flow
   - Perform load testing to ensure scalability of the new system

## Migration Plan

1. Develop the new Inngest-based system alongside the existing implementation
   - Create new files for Inngest functions and configurations
   - Implement new Convex mutations and queries for the Inngest-based flow

2. Gradually migrate chat functionality to the new system, starting with non-critical features
   - Begin with simple message processing without complex tool usage
   - Incrementally add support for different tools and complex scenarios

3. Implement feature flags to easily switch between old and new implementations
   - Use environment variables or a feature flag system to control which implementation is active

4. Conduct thorough testing in a staging environment
   - Set up a separate staging environment with Inngest and Convex
   - Perform extensive testing of the new system in isolation

5. Roll out the new system to production in phases, monitoring for any issues
   - Start with a small percentage of users or specific test accounts
   - Gradually increase the rollout while monitoring performance and errors

6. Once fully deployed and stable, remove the old implementation and related code
   - Remove Vercel AI SDK dependencies
   - Clean up unused functions and components

## Next Steps

1. Set up Inngest in the project
   - Install Inngest
   - Create `inngest/client.ts` for Inngest configuration
   - Set up initial Inngest function templates

2. Begin implementing the `sendMessage()` server action
   - Create a new Convex mutation for saving the initial message
   - Implement Inngest event triggering within the mutation

3. Start developing the main Inngest event handler for message processing
   - Create `inngest/functions/processMessage.ts`
   - Implement the core logic for processing messages, including LLM interaction

4. Update the Convex schema
   - Add new fields for Inngest job tracking
   - Create new queries and mutations for the updated schema

5. Modify the client-side chat components
   - Update `hooks/chat/useChatCore.ts` to use Convex queries and subscriptions
   - Adjust `panes/chat/ChatPane.tsx` to handle asynchronous updates

6. Implement error handling and monitoring
   - Set up error handling in Inngest functions
   - Configure logging and monitoring for the new system

7. Develop a comprehensive testing strategy
   - Create unit tests for new Inngest functions and Convex mutations
   - Develop integration tests for the entire chat flow

8. Plan the phased rollout and feature flag implementation
   - Determine which features to migrate first
   - Implement a feature flag system for easy switching between implementations

By following this detailed plan, we can systematically refactor our chat system to use Inngest for background processing, resulting in a more robust and scalable solution.