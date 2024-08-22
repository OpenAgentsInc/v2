# GraphRAG Implementation for OpenAgents

## Introduction
GraphRAG is a structured, hierarchical approach to Retrieval Augmented Generation (RAG) that can significantly enhance the capabilities of our AI productivity dashboard. By implementing a basic version of GraphRAG, we can improve the system's ability to understand and reason about the complex relationships within our codebase and user data.

## How GraphRAG Can Help OpenAgents

1. **Enhanced Code Understanding**: By creating a knowledge graph of our codebase, we can help the AI better understand the relationships between different components, functions, and data structures.

2. **Improved Query Responses**: GraphRAG can provide more accurate and contextually relevant responses to user queries about the codebase, features, or documentation.

3. **Holistic View of User Data**: By applying GraphRAG to user threads and messages, we can create a more comprehensive understanding of user interactions and conversations over time.

4. **Better Thread Management**: GraphRAG can help in generating more accurate thread titles and summaries by considering the broader context of conversations.

5. **Advanced Search Capabilities**: Implementing GraphRAG can enable more sophisticated search functionality across threads and messages.

## Key Concepts

1. **Files**: Individual source code files within a repository. They are the basic units of our codebase and contain the actual code content.

2. **Entities**: Distinct elements within the code, such as functions, classes, variables, or modules. Entities are the building blocks of our knowledge graph.

3. **Relationships**: Connections between entities, representing how different parts of the code interact or depend on each other. Examples include function calls, inheritance, or imports.

4. **Communities**: Groups of related entities that form a cohesive unit or serve a common purpose within the codebase. Communities help in understanding the high-level structure and organization of the code.

The importance of these concepts lies in their ability to capture the structure and semantics of the codebase, enabling more intelligent and context-aware interactions with the AI system.

## Implementation Plan

1. **Define TextUnits**: 
   - Use individual GitHub files in our repo as TextUnits for the codebase.
   - For user data, consider using individual messages or entire threads as TextUnits.

2. **Entity Extraction**:
   - For codebase: Extract functions, classes, variables, and file names as entities.
   - For user data: Extract key concepts, user names, and important terms from messages and threads.

3. **Relationship Extraction**:
   - For codebase: Identify imports, function calls, and data flow between components.
   - For user data: Track conversation flow, topic relationships, and user interactions.

4. **Knowledge Graph Construction**:
   - Use Convex's existing capabilities, including vector similarity search, to store and query entities and relationships.
   - Implement a basic version of the Leiden algorithm for community detection, if possible within Convex's constraints.

5. **Summary Generation**:
   - Develop a system to generate summaries for code components and user threads.
   - Use existing AI capabilities to create concise descriptions of entities and communities.

6. **Query System Enhancement**:
   - Modify the existing chat system to incorporate GraphRAG-based retrieval.
   - Implement both global and local search functionalities as described in the GraphRAG documentation.

7. **Integration with Existing Systems**:
   - Update the `useChat.ts` hook to incorporate GraphRAG-enhanced responses.
   - Modify relevant Convex functions (e.g., `saveChatMessage.ts`, `getThreadMessages.ts`) to work with the new graph structure.

8. **UI Updates**:
   - Enhance the chat pane to visualize relationships between messages and concepts.
   - Add a new pane for exploring the knowledge graph of the codebase.

## Proposed Convex Schemas for GitHub Codebase Indexing

To implement GraphRAG for indexing a GitHub codebase using Convex, we propose the following schemas:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... (existing schemas)

  codeFiles: defineTable({
    user_id: v.id("users"), // The user who owns or is analyzing this file
    repo_org: v.string(), // The organization owning the repository
    repo_name: v.string(), // The name of the repository
    branch: v.string(), // The branch where this file version exists
    sha: v.string(), // The commit SHA for this version of the file
    path: v.string(), // The file path within the repository
    content: v.string(), // The actual content of the file
    last_updated: v.string(), // Timestamp of the last update
    embedding: v.array(v.number()), // Vector embedding for similarity search
  })
    .index('by_user', ['user_id'])
    .index('by_repo', ['user_id', 'repo_org', 'repo_name'])
    .index('by_branch', ['user_id', 'repo_org', 'repo_name', 'branch'])
    .index('by_path', ['user_id', 'repo_org', 'repo_name', 'branch', 'path'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 1536, // Adjust based on the embedding model used
    }),

  codeEntities: defineTable({
    user_id: v.id("users"), // The user who owns or is analyzing this entity
    file_id: v.id("codeFiles"), // Reference to the file containing this entity
    type: v.string(), // Type of the entity, e.g., "function", "class", "variable"
    name: v.string(), // Name of the entity
    start_line: v.number(), // Starting line of the entity in the file
    end_line: v.number(), // Ending line of the entity in the file
    description: v.optional(v.string()), // Optional description or documentation
    embedding: v.array(v.number()), // Vector embedding for similarity search
  })
    .index('by_user', ['user_id'])
    .index('by_file', ['file_id'])
    .index('by_type', ['user_id', 'type'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 1536, // Adjust based on the embedding model used
    }),

  codeRelationships: defineTable({
    user_id: v.id("users"), // The user who owns or is analyzing this relationship
    source_entity_id: v.id("codeEntities"), // The entity where the relationship originates
    target_entity_id: v.id("codeEntities"), // The entity where the relationship ends
    type: v.string(), // Type of relationship, e.g., "imports", "calls", "inherits"
    description: v.optional(v.string()), // Optional description of the relationship
  })
    .index('by_user', ['user_id'])
    .index('by_source', ['source_entity_id'])
    .index('by_target', ['target_entity_id']),

  codeCommunities: defineTable({
    user_id: v.id("users"), // The user who owns or is analyzing this community
    name: v.string(), // Name of the community
    description: v.string(), // Description of the community's purpose or characteristics
    members: v.array(v.id("codeEntities")), // Array of entity IDs belonging to this community
    embedding: v.array(v.number()), // Vector embedding for similarity search
  })
    .index('by_user', ['user_id'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 1536, // Adjust based on the embedding model used
    }),
});
```

These schemas allow us to:

1. Store individual code files with their content, git-related metadata, and vector embeddings.
2. Extract and store code entities (functions, classes, variables) with their locations, descriptions, and associated file information.
3. Capture relationships between code entities, showing how different parts of the code interact.
4. Group related entities into communities for higher-level understanding of code structure.
5. Utilize Convex's vector similarity search capabilities for efficient querying.
6. Associate all data with specific users, allowing for personalized analysis and privacy control.
7. Track changes over time using git-like versioning (branches and commit SHAs).

## Demo/Trial Run Instructions

As a new agent, your task is to perform a demo/trial run of indexing and extracting entities from the OpenAgents codebase, focusing on the user sign-up process (authentication). Follow these steps:

1. Use the `view_hierarchy` tool to explore the project structure and identify relevant files related to user sign-up and authentication.

2. Use the `view_file` tool to examine the contents of the identified files.

3. Extract and document the following in a new file called `docs/graphrag_test_index.md`:

   a. **Files**: List the relevant files you've identified, including their paths.
   
   b. **Entities**: Identify and list key functions, classes, and variables related to user sign-up and authentication.
   
   c. **Relationships**: Describe how the identified entities interact with each other (e.g., function calls, imports).
   
   d. **Communities**: Group related entities into logical communities (e.g., "User Authentication", "Database Operations").

4. For each entity, provide a brief description of its purpose and how it contributes to the user sign-up process.

5. Create a simple diagram or textual representation of the relationships between entities.

6. Summarize your findings, highlighting the key components and flow of the user sign-up process.

Use Markdown formatting in the `docs/graphrag_test_index.md` file to structure your documentation clearly. Include code snippets where relevant to illustrate entities and their relationships.

Example structure for `docs/graphrag_test_index.md`:

```markdown
# GraphRAG Test Index: User Sign-up Process

## Files
- `path/to/file1.ts`
- `path/to/file2.ts`
...

## Entities

### Functions
- `createUser()`
  - Description: Creates a new user in the database
  - File: `path/to/file1.ts`

### Classes
- `UserAuth`
  - Description: Handles user authentication
  - File: `path/to/file2.ts`

...

## Relationships
- `createUser()` calls `UserAuth.validate()`
- `UserAuth` imports `DatabaseConnector` from `path/to/file3.ts`
...

## Communities
1. User Management
   - Entities: `createUser()`, `UserAuth`, ...
2. Database Operations
   - Entities: `DatabaseConnector`, `saveUser()`, ...

## Process Flow
1. User submits sign-up form
2. `createUser()` is called
3. `UserAuth.validate()` checks input
4. If valid, `DatabaseConnector.saveUser()` stores the new user
...

## Summary
The user sign-up process involves [brief overview of the process and key components]...
```

Remember to use the `view_hierarchy` and `view_file` tools to gather the necessary information. Focus on creating a clear and concise representation of the user sign-up process using the GraphRAG concepts (Files, Entities, Relationships, and Communities).

## Next Steps

After completing the demo/trial run:

1. Review the created `docs/graphrag_test_index.md` file to ensure it provides a comprehensive overview of the user sign-up process.
2. Use this demo as a basis for implementing the full GraphRAG system using Convex, as outlined in the previous sections of this document.
3. Iterate on the demo to include more features and processes of the OpenAgents system.
4. Implement the proposed schemas in the Convex configuration.
5. Develop scripts to parse GitHub repositories, including handling different branches and commits.
6. Create functions to generate and update vector embeddings for files, entities, and communities.
7. Implement basic entity and relationship extraction for the codebase, considering the git-like structure.
8. Create a simple knowledge graph visualization tool using the stored data, allowing users to explore different versions of the codebase.
9. Modify the chat system to incorporate basic GraphRAG concepts, utilizing Convex's vector search capabilities and considering the user-specific and git-like nature of the data.
10. Implement version comparison features to show how the codebase structure changes across different commits or branches.
11. Test and iterate on the implementation, focusing on performance, accuracy, and user-specific experiences.

This demo will serve as a valuable proof of concept and guide for the full implementation of GraphRAG in the OpenAgents project. By implementing GraphRAG using Convex's capabilities and incorporating git-like versioning, we can significantly enhance OpenAgents' ability to understand and reason about codebases. This approach will provide users with more insightful and context-aware interactions with both the AI and the codebase, while also allowing for analysis of code evolution over time.