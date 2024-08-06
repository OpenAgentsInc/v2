# Request lifecycle

Here we document the lifecycle of core requests:

## What happens when a guest visits the homepage (openagents.com)

1. The server receives the request for the homepage.
2. Next.js processes the request through the app/layout.tsx file.
3. The RootLayout component is rendered, which includes:
   - Setting up metadata and viewport settings
   - Loading necessary fonts (GeistSans, GeistMono, jetbrainsMono)
   - Rendering the basic HTML structure
   - Including the Toaster component for notifications
   - Wrapping the content in the Providers component
4. The Providers component (from components/providers.tsx) sets up:
   - ClerkProvider for authentication
   - NextThemesProvider for theme management
   - SidebarProvider for sidebar state management
   - TooltipProvider for tooltips
5. The Header component is rendered
6. The specific page component for the homepage is rendered within the main content area.
7. The TailwindIndicator component is added for development purposes.
8. The fully rendered HTML is sent back to the client.

## What happens when an authenticated user visits the homepage

The process is similar to a guest visit, with the following additions:

1. The ClerkProvider checks the authentication status.
2. If authenticated, Clerk provides user session information to the components that need it.
3. The Header component may display user-specific information or options based on the Clerk session.
4. The main content area may show personalized content or dashboard elements, utilizing the user information from Clerk.

## What happens when an authed user goes to a chat page

1. The server receives the request for the chat page.
2. The RootLayout and Providers are rendered as described above.
3. The specific chat page component (app/(chat)/page.tsx) is rendered within the main content area.
4. In the IndexPage component of app/(chat)/page.tsx:
   - A new chat ID is generated using nanoid()
   - The currentUser() function from Clerk is called to get the authenticated user's information
   - If no user is found (not authenticated), an empty fragment is returned
   - The getMissingKeys() function is called to check for required API keys or configurations
   - The Chat component is rendered with the following props:
     - id: The generated chat ID
     - user: An object containing the user's ID from Clerk
     - missingKeys: The result of getMissingKeys()
   - The Chat component is wrapped in an AI component, which receives an initial AI state with the chat ID and an empty messages array
5. The Chat component (components/chat.tsx) is rendered:
   - It uses the useUIState and useAIState hooks to manage the chat state
   - The chat ID is stored in local storage using the useLocalStorage hook
   - If the user is authenticated and there's only one message, the URL is updated to include the chat ID
   - The component renders either a ChatList (if there are messages) or an EmptyScreen
   - A ChatPanel component is rendered at the bottom of the page
6. The ChatPanel component (components/chat-panel.tsx) is rendered:
   - It manages the input state for the user's messages
   - It provides example messages when the chat is empty
   - It handles the submission of user messages using the submitUserMessage function from the useActions hook
   - It manages the state for sharing the chat
   - It renders a PromptForm component for user input
7. As the user interacts with the chat:
   - The submitUserMessage function (from lib/chat/actions.tsx) is called when a message is sent
   - The function updates the AI state with the new user message
   - It then streams the AI response using the streamUI function, which can use either OpenAI or Anthropic models
   - The AI response is processed and added to the UI state
   - The chat history is updated with both the user message and the AI response
8. Chat sharing functionality:
   - When the chat has at least two messages, a "Share" button is displayed
   - Clicking the "Share" button opens a ChatShareDialog
   - The shareChat function (from app/actions.ts) is used to handle the sharing process

## AI and State Management (lib/chat/actions.tsx)

1. The AI component is created using createAI from the ai/rsc library, with the following configuration:
   - actions: Defines the submitUserMessage function
   - initialUIState: An empty array
   - initialAIState: Contains a generated chatId and an empty messages array
   - onGetUIState: Retrieves the current UI state for authenticated users
   - onSetAIState: Saves the chat state for authenticated users

2. The submitUserMessage function:
   - Updates the AI state with the new user message
   - Streams the AI response using streamUI
   - Supports both OpenAI and Anthropic models
   - Uses a system prompt that identifies the AI as a coding agent for OpenAgents.com
   - Processes the AI response and updates the UI state

3. The onSetAIState function:
   - Creates a chat object with the following properties:
     - id: The chat ID
     - title: First 100 characters of the first message
     - userId: The authenticated user's ID
     - createdAt: Current timestamp
     - messages: Array of chat messages
     - path: URL path for the chat
   - Saves the chat using the saveChat function (likely interacts with a database)

4. The getUIStateFromAIState function:
   - Converts the AI state (chat history) into UI components
   - Handles different message types (user, assistant, tool)
   - Supports rendering file contents for the viewFileContents tool

Note: While the code doesn't explicitly show Vercel KV usage, the saveChat function (called in onSetAIState) likely interacts with a database, which could be Vercel KV, to persist chat data.

Important points about user ID handling and state management:
- User IDs are obtained from the auth session
- The user ID is used to associate chats with specific users
- Chat state is managed using the createAI function from the ai/rsc library
- The nanoid() function is used to generate unique IDs for chats and messages
- The AI component supports both OpenAI and Anthropic models
- Tool calls (e.g., viewFileContents) are supported and can be rendered in the UI