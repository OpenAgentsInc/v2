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

6. Testing
   - Develop unit tests for individual components:
     - Test Inngest functions
     - Test Convex mutations and queries
   - Create integration tests for the entire chat flow
   - Perform load testing to ensure scalability of the new system

## Additional Steps

1. Implement Retry Logic
   - Add retry mechanisms for failed steps in the `processMessage` function
   - Use Inngest's built-in retry capabilities

2. Add Timeout Handling
   - Implement timeout logic for long-running processes
   - Use Inngest's `step.sleep()` or `step.sleepUntil()` methods for controlled delays

3. Enhance Context Gathering
   - Implement a more sophisticated context gathering step in the `processMessage` function
   - Consider using vector databases or other efficient methods for retrieving relevant context

4. Implement Tool Selection Logic
   - Develop a system for dynamically selecting and preparing tools based on message content
   - Create a tool registry or configuration system for easy tool management

5. Add Streaming Responses
   - Implement streaming responses from the AI to provide faster, incremental updates to the user
   - Use Convex's real-time capabilities to push partial responses to the client

6. Implement Caching
   - Add caching mechanisms for frequently accessed data to improve performance
   - Consider using Convex's built-in caching capabilities or implement a separate caching layer

7. Add Analytics and Monitoring
   - Implement detailed analytics for chat interactions and AI performance
   - Set up monitoring alerts for critical errors or performance issues

8. Enhance Security Measures
   - Implement additional security checks and validations throughout the chat flow
   - Ensure proper data sanitization and input validation

9. Optimize Database Queries
   - Review and optimize Convex queries for better performance
   - Implement efficient pagination for large message histories

10. Implement Feature Flags
    - Add a feature flag system to easily toggle between old and new implementations
    - Use environment variables or a dedicated feature flag service

## Migration Plan

1. Develop the new Inngest-based system alongside the existing implementation
2. Gradually migrate chat functionality to the new system, starting with non-critical features
3. Implement feature flags to easily switch between old and new implementations
4. Conduct thorough testing in a staging environment
5. Roll out the new system to production in phases, monitoring for any issues
6. Once fully deployed and stable, remove the old implementation and related code

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

6. Develop a comprehensive testing strategy:
   - Create unit tests for new Inngest functions and Convex mutations
   - Develop integration tests for the entire chat flow

7. Plan the phased rollout and feature flag implementation:
   - Determine which features to migrate first
   - Implement a feature flag system for easy switching between implementations

8. Optimize performance:
   - Implement caching strategies
   - Optimize database queries and indexes

9. Enhance security:
   - Review and improve authentication and authorization checks
   - Implement additional security measures as needed

## Refactored `sendMessage` Function

The `sendMessage` function has been refactored into separate files for better modularity and maintainability:

1. `lib/chat/authenticateUser.ts`: Handles user authentication using Clerk.
2. `lib/chat/triggerInngestEvent.ts`: Triggers the Inngest event for message processing.
3. `lib/chat/sendMessage.ts`: The main function that coordinates the message sending process.

This refactoring allows for easier testing, maintenance, and potential reuse of the authentication and event triggering logic in other parts of the application.

By following this comprehensive plan and implementing these additional steps, we can create a robust, scalable, and feature-rich chat system using Inngest for background processing.