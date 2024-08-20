# OpenAgents Mobile App

The OpenAgents mobile app is a powerful tool that allows you to command AI agents directly from your smartphone. Built with React Native and Expo, this app brings the capabilities of OpenAgents to your fingertips, offering a mobile version of the all-in-one AI productivity dashboard available at openagents.com.

## Features

- Command AI agents on-the-go
- Built with React Native and Expo for cross-platform compatibility
- Seamless integration with OpenAgents ecosystem
- Long-lived agents with function calling capabilities
- Full-screen heads-up display (HUD) with draggable, resizable panes

## Pricing

The OpenAgents mobile app is available for $29 per month, providing you with full access to AI agent control from your phone.

## Technology Stack

Our app is built using the following key packages and technologies:

- React Native and Expo: For cross-platform mobile app development
- RevenueCat: For managing in-app subscriptions and purchases
- Convex: For real-time backend and database management, handling messages, threads, and user data
- React Native Gesture Handler: For handling complex touch and gesture interactions in the HUD interface
- Clerk: For secure authentication and user management
- Zustand: For state management across the app
- React Native's built-in styling system: For consistent and efficient styling

## Implementation Plan

1. Set up the basic React Native and Expo project structure.
2. Implement the authentication flow using Clerk.
3. Create the main HUD interface with draggable, resizable panes using React Native Gesture Handler.
4. Integrate Convex for real-time data management:
   - Implement message handling (saveChatMessage, fetchThreadMessages, etc.)
   - Set up thread management (createNewThread, getUserThreads, etc.)
   - Handle user data (createOrGetUser, updateUserCredits, etc.)
5. Implement the chat interface with long-lived agents:
   - Use a custom hook for chat logic (similar to the useChat hook in the web version)
   - Implement function calling capabilities for agents
6. Set up RevenueCat for subscription management.
7. Implement the user pane with settings and credit balance display.
8. Add sharing functionality for threads.
9. Implement dynamic title generation for threads using AI.

## Long-lived Agents and Function Calling

The OpenAgents mobile app supports long-lived agents with function calling capabilities. This means that agents can maintain context across multiple interactions and can call specific functions to perform tasks or retrieve information.

Implementation details:
- Agents are associated with threads (chats) and persist across multiple messages.
- Function calling is implemented through an ingest system, allowing agents to execute predefined functions.
- A custom hook manages most of the chat logic, including agent interactions and function calling.

## Data Structure

The app uses three primary data types:
1. Message: Represents individual messages in a chat.
2. Thread: Represents a chat session (called 'chats' in the front-end).
3. User: Stores user information and preferences.

These data structures are managed using Convex, ensuring real-time updates and efficient data handling.

## UI Components

Instead of using Shad UI components (which are designed for web applications), the mobile app will use:
- React Native's built-in components (View, Text, TextInput, etc.)
- Custom components built specifically for the mobile interface
- React Native community packages for more complex UI elements (e.g., react-native-elements, react-native-paper)

These components will be styled using React Native's built-in styling system to create a consistent and efficient UI that matches the OpenAgents brand.

## Getting Started

To get started with the OpenAgents mobile app:

1. Download the app from the App Store or Google Play Store
2. Sign up for an account or log in with your existing OpenAgents credentials
3. Subscribe to the mobile plan for $29/month
4. Start commanding AI agents from your smartphone

For more detailed information on using the app and its features, please refer to our in-app documentation or contact our support team.

## Feedback and Support

We're constantly working to improve the OpenAgents mobile experience. If you have any feedback, suggestions, or need support, please reach out to our team through the app or visit our website.

Happy agent commanding!