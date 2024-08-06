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
   - Wrapping the content in the Providers component for theme management
   - Rendering the Header component
   - Rendering the main content area (children)
4. The specific page component for the homepage is rendered within the main content area.
5. The TailwindIndicator component is added for development purposes.
6. The fully rendered HTML is sent back to the client.

## What happens when an authenticated user visits the homepage

The process is similar to a guest visit, with the following additions:

1. The server checks for authentication status (likely using NextAuth.js, based on the project structure).
2. If authenticated, user-specific data may be fetched and passed to the appropriate components.
3. The Header component may display user-specific information or options.
4. The main content area may show personalized content or dashboard elements.

## What happens when an authed user goes to a chat page

1. The authentication status is verified.
2. The RootLayout is rendered as described above.
3. The specific chat page component (likely located in the app/(chat) directory) is rendered within the main content area.
4. This chat component may include:
   - Loading the user's chat history
   - Connecting to the AI model (OpenAI gpt-3.5-turbo by default, but configurable)
   - Setting up the streaming chat UI using the Vercel AI SDK
   - Initializing the chat interface with message history and input area
5. As the user interacts with the chat, client-side JavaScript handles real-time updates and communicates with the server for AI responses.

Note: The actual implementation details may vary based on the specific components and logic implemented in the (chat) directory and related files.
