# Database Knowledge and Lessons Learned

## Database Structure
- The application uses a PostgreSQL database with three main tables: `users`, `threads`, and `messages`.
- Foreign key relationships exist between these tables.

## Initialization and Seeding
- Database initialization is handled in `lib/init-db.ts`.
- Seeding logic is in `lib/db/seed.ts`.
- The `seed` function should be called only once when the application starts.

## Common Issues and Solutions

1. **Table Creation Order**: 
   - Ensure tables are created in the correct order to avoid foreign key constraint issues.
   - Create `users` table first, then `threads`, and finally `messages`.

2. **Multiple SQL Statements**:
   - Vercel Postgres doesn't support multiple SQL statements in a single query.
   - Use separate `sql` calls for each statement, especially for ALTER TABLE commands.

3. **Error Handling**:
   - Implement try-catch blocks in database operations for better error handling and logging.
   - Log detailed error messages to help with debugging.

4. **Circular Dependencies**:
   - Be cautious of circular dependencies when adding foreign key constraints.
   - For example, `threads.first_message_id` should be added after inserting the first message.

5. **Logging**:
   - Implement detailed logging throughout the database operations and data fetching process.
   - Log input parameters and results of database queries for easier debugging.

6. **Type Consistency**:
   - Ensure consistency in types, especially when dealing with IDs (string vs number).
   - Use appropriate type casting when necessary (e.g., `parseInt` for string IDs).

7. **Prepared Statements**:
   - Vercel Postgres uses prepared statements, which don't allow multiple commands.
   - Separate complex operations into individual SQL statements.

## Best Practices

1. **Separation of Concerns**:
   - Keep database queries in a separate file (e.g., `lib/db/queries.ts`).
   - Use server actions (in `app/actions.ts`) to interface between the frontend and database operations.

2. **Error Propagation**:
   - Properly propagate errors up the call stack to handle them at the appropriate level.

3. **Caching**:
   - Implement caching for frequently accessed data to improve performance.

4. **Transaction Management**:
   - Use transactions for operations that involve multiple related database changes.

5. **Regular Testing**:
   - Regularly test database operations, especially after schema changes.
   - Implement integration tests for database operations.

By following these lessons and best practices, you can avoid common pitfalls and maintain a robust database interaction layer in your application.