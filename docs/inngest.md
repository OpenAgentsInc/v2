# Inngest Chat Refactor

We are refactoring our chat system to use background jobs via Inngest, replacing the previous implementation that used the useChat hook from the Vercel AI SDK. This change will decouple the chat flow from the browser session, allowing for more robust and persistent chat experiences.

## New Chat Flow

1. User Interaction
   - Any React component or function can trigger the `sendMessage()` server action.

2. Server Action: `sendMessage()`
   a. User Authentication
      - Ensure the user is authenticated
      - Retrieve the user object from the database
   
   b. Message Persistence
      - Save the user's message to the thread in the Convex database
      - Trigger an Inngest event for message processing
   
   c. Return initial response to the client
      - Provide an acknowledgment or initial response to maintain UI responsiveness

3. Inngest Event Handler: `processMessage`
   a. Context Gathering
      - Retrieve relevant context from the database (e.g., thread history, user preferences)
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
      - Trigger a real-time update to the client (e.g., via WebSocket or SSE)

4. Client-Side Updates
   - Listen for real-time updates and display new messages in the UI
   - Handle any required UI changes based on the AI's response

5. Continuation and Retry Logic
   - Implement logic for the AI agent to:
     - Wait for a specified amount of time before continuing or retrying
     - Wait for user input if required
   - Use Inngest's scheduling capabilities for delayed actions or retries

## Implementation Details

1. Inngest Setup
   - Install and configure Inngest in the project
   - Set up Inngest functions for message processing and any other background tasks

2. Database Updates
   - Modify the Convex schema if necessary to accommodate new fields for Inngest job tracking

3. Server-Side Changes
   - Implement the `sendMessage()` server action
   - Create Inngest event handlers for message processing
   - Develop utility functions for context gathering and tool preparation

4. Client-Side Updates
   - Modify the chat UI to work with the new asynchronous flow
   - Implement real-time updates using WebSockets or Server-Sent Events

5. Error Handling and Monitoring
   - Implement robust error handling in Inngest functions
   - Set up monitoring and logging for background jobs

6. Testing
   - Develop unit tests for individual components
   - Create integration tests for the entire chat flow
   - Perform load testing to ensure scalability of the new system

## Migration Plan

1. Develop the new Inngest-based system alongside the existing implementation
2. Gradually migrate chat functionality to the new system, starting with non-critical features
3. Implement feature flags to easily switch between old and new implementations
4. Conduct thorough testing in a staging environment
5. Roll out the new system to production in phases, monitoring for any issues
6. Once fully deployed and stable, remove the old implementation and related code

## Next Steps

- Set up Inngest in the project and create initial function templates
- Begin implementing the `sendMessage()` server action
- Start developing the main Inngest event handler for message processing
- Plan the client-side changes required to support the new asynchronous flow