# GraphRAG Test Index: OpenAgents Codebase

[Previous content unchanged...]

## Communities
1. Authentication and User Management
   - Entities: `createOrGetUser()`, `users` table, Clerk authentication, components/auth
2. Chat System
   - Entities: `useChat()`, `sendMessage()`, `Thread`, `messages` table, `threads` table, panes/chat, store/chat.ts
3. Data Storage and Retrieval
   - Entities: Convex database tables (documents, sbv_datum, users, threads, messages)
4. UI and State Management
   - Entities: React hooks, Zustand stores (useBalanceStore, useModelStore, useRepoStore, useToolStore, useChatStore)
5. Pane Management
   - Entities: PaneManager.tsx, Pane.tsx, store/pane.ts, store/panes
6. User Interface Components
   - Entities: components/ui, components/input, components/dom
7. Credit System
   - Entities: components/credits, store/balance.ts, lib/calculateMessageCost.ts, lib/deductUserCredits.ts
8. Knowledge Management
   - Entities: components/knowledge
9. Email Integration
   - Entities: components/email
10. Repository Management
    - Entities: store/repo.ts, lib/github, lib/githubUtils.ts
11. AI Model Management
    - Entities: store/models.ts, lib/models.ts
12. Tool Management
    - Entities: store/tools.ts, types/tool-call.ts, types/tool-context.ts, types/tool-invocation.ts, types/tool-result.ts
13. Landing Page
    - Entities: components/landing
14. Canvas Visualization
    - Entities: components/canvas
15. Software Benchmark System
    - Entities: components/swebench, app/swebench
16. Payment Integration
    - Entities: lib/stripe
17. API Management
    - Entities: app/api
18. Sharing Functionality
    - Entities: app/share
19. System Configuration
    - Entities: app/siteConfig.ts, lib/systemPrompt.ts
20. Type Definitions
    - Entities: types/*.ts
21. Utility Functions
    - Entities: lib/util, lib/utils.ts
22. Font Management
    - Entities: lib/fonts.ts
23. Server Actions
    - Entities: types/server-action-result.ts

[Rest of the content unchanged...]