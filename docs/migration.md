# Migration from Vercel Postgres to Convex

This document outlines the migration process from Vercel Postgres to Convex, including the original table structure, considerations for the migration, and the implementation of the migration script.

## Original Vercel Postgres Table Structure

### Users Table

```sql
CREATE TABLE "public"."users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "clerk_user_id" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "image" varchar(255),
    "credits" numeric(10,2) NOT NULL DEFAULT 0,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX users_clerk_user_id_key ON public.users USING btree (clerk_user_id);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE INDEX idx_users_clerk_user_id ON public.users USING btree (clerk_user_id);
```

### Threads Table

```sql
CREATE TABLE "public"."threads" (
    "id" int4 NOT NULL DEFAULT nextval('threads_id_seq'::regclass),
    "user_id" int4 NOT NULL,
    "clerk_user_id" varchar(255) NOT NULL,
    "metadata" jsonb,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE INDEX idx_threads_user_id ON public.threads USING btree (user_id);
CREATE INDEX idx_threads_clerk_user_id ON public.threads USING btree (clerk_user_id);
```

### Messages Table

```sql
CREATE TABLE "public"."messages" (
    "id" int4 NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
    "thread_id" int4 NOT NULL,
    "clerk_user_id" varchar(255) NOT NULL,
    "role" varchar(50) NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "tool_invocations" jsonb,
    "finish_reason" varchar(50),
    "total_tokens" int4,
    "prompt_tokens" int4,
    "completion_tokens" int4,
    "model_id" varchar(255),
    "cost_in_cents" numeric(10,2),
    PRIMARY KEY ("id")
);

CREATE INDEX idx_messages_thread_id ON public.messages USING btree (thread_id);
CREATE INDEX idx_messages_clerk_user_id ON public.messages USING btree (clerk_user_id);
```
## Migration Considerations

1. **ID Fields**: Convex uses string IDs, while the Vercel Postgres tables use integer IDs. The migration script handles this conversion, especially for foreign key relationships.

2. **Timestamps**: Convex has built-in `createdAt` and `updatedAt` fields. We use these instead of custom timestamp fields.

3. **Schema Changes**: The Convex schema includes additional fields for users, such as `name` and `username`. These are derived from the email address during migration.

4. **Data Types**: Some data types have been adjusted. For example, `jsonb` fields in Postgres are mapped to appropriate Convex types.

5. **Indexes**: Convex handles indexing differently. Ensure that the necessary indexes are created in the Convex schema to maintain query performance.

6. **Foreign Key Relationships**: Convex doesn't use traditional foreign keys. The migration script maintains relationships between tables through appropriate field references.

7. **Clerk Integration**: Both systems use Clerk for authentication. The `clerk_user_id` is consistently used across the migration.

8. **Data Validation**: Convex uses schema validation. The migration script ensures that all data from Vercel Postgres meets the validation requirements of the Convex schema.

9. **Handling Null Values**: The migration script now handles potential null values for fields like `completion_tokens`, `total_tokens`, `prompt_tokens`, and `cost_in_cents` by providing default values (0) when these fields are null.

10. **Idempotency**: The migration script is now idempotent, meaning it can be run multiple times without creating duplicate data. It checks for existing data and updates or skips as appropriate.

## Migration Script

The migration script (`scripts/migrate_vercel_to_convex.ts`) handles the migration of data from Vercel Postgres to Convex. Here are the key features of the script:

- It uses the `dotenv` package to load environment variables from `.env.local`.
- It connects to both the Vercel Postgres database and the Convex database.
- It migrates users, threads, and messages in that order to maintain data integrity.
- It handles the conversion of integer IDs to Convex's string IDs.
- It derives `name` and `username` fields for users from their email addresses.
- It maintains relationships between entities using Convex's ID system.
- It handles potential null values for certain fields by providing default values.
- It checks for existing data before creating new entries:
  - For users, it updates existing users instead of creating duplicates.
  - For threads, it skips creation if a thread already exists for a user.
  - For messages, it checks if a message already exists in a thread at a specific timestamp before creating a new one.

### Running the Migration Script

To run the migration script:

1. Ensure that your `.env.local` file contains the necessary environment variables, including `CONVEX_URL`.
2. Run the script using the following command:

   ```
   npx tsx scripts/migrate_vercel_to_convex.ts
   ```

3. Monitor the console output for any warnings or errors during the migration process.

The script can be run multiple times safely. It will update existing users, skip existing threads, and only add new messages that don't already exist in the Convex database.

## Post-Migration Tasks

1. Verify data integrity after migration:
   - Check that all users, threads, and messages have been migrated correctly.
   - Ensure that relationships between entities are maintained.
   - Verify that derived fields (like `name` and `username`) are populated correctly.
   - Check that fields that previously contained null values have been properly handled with default values.

2. Update any application code that relies on the old database structure:
   - Replace Vercel Postgres queries with Convex queries.
   - Update any code that assumes integer IDs to work with Convex's string IDs.
   - Ensure that your application can handle the default values (0) for fields that might have been null in the original database.

3. Test all functionality thoroughly to ensure the migration hasn't introduced any issues:
   - Test user authentication and profile management.
   - Verify that threads and messages are displayed correctly.
   - Check that all CRUD operations work as expected with the new Convex backend.
   - Pay special attention to features that involve fields that previously could have been null.

4. Update documentation to reflect the new data structure and any changes in querying or data management processes.

5. Monitor application performance and adjust indexes in the Convex schema if necessary.

6. If needed, run the migration script again to catch any data that might have been added to the Vercel Postgres database after the initial migration.

## Conclusion

This migration represents a significant change in the data storage and management approach. While the basic structure remains similar, the shift to Convex introduces new capabilities and constraints that need to be carefully managed throughout the migration process and in ongoing development.

The migration script provides a solid foundation for transferring data from Vercel Postgres to Convex, including handling potential null values in certain fields and managing existing data. It can be run multiple times to ensure all data is properly migrated or to update existing data.

However, it's crucial to thoroughly test and verify the migrated data and updated application code to ensure a smooth transition. Pay special attention to how your application handles fields that now have default values instead of being null, and make any necessary adjustments to maintain the expected behavior.

Remember that while the migration script is designed to be safe to run multiple times, it's always a good practice to back up your data before performing any migration or running scripts that modify your database.

## Recent Updates

As of the latest update, the following changes have been made to improve the migration process:

1. **New updateUser Function**: A new `updateUser` function has been added to the Convex backend. This function allows for updating existing user records during the migration process.

2. **Migration Script Enhancement**: The migration script now uses the `updateUser` function to update existing users instead of creating duplicates. This ensures that user data is kept up-to-date during multiple runs of the migration script.

3. **Export Update**: The `updateUser` function has been properly exported in the `convex/users/index.ts` file, making it available for use in the migration script and other parts of the application.

These updates improve the robustness and efficiency of the migration process, particularly when dealing with existing user data. The migration script can now handle updates to user information more effectively, reducing the risk of data inconsistencies.

When running the migration script after these updates, pay attention to the console output for any messages related to user updates. This will help verify that the new `updateUser` function is working as expected during the migration process.