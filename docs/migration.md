# Migration from Vercel Postgres to Convex

This document outlines the migration process from Vercel Postgres to Convex, including the original table structure and considerations for the migration.

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

1. **ID Fields**: Convex uses string IDs, while the Vercel Postgres tables use integer IDs. The migration script needs to handle this conversion, especially for foreign key relationships.

2. **Timestamps**: Convex has built-in `createdAt` and `updatedAt` fields. We should use these instead of custom timestamp fields.

3. **Schema Changes**: The current Convex schema (in `convex/schema.ts`) includes additional fields for users, such as `name` and `username`. These fields are not present in the Vercel Postgres schema and will need to be handled during migration.

4. **Data Types**: Some data types may need to be adjusted. For example, `jsonb` fields in Postgres should be mapped to appropriate Convex types.

5. **Indexes**: Convex handles indexing differently. We need to ensure that the necessary indexes are created in the Convex schema to maintain query performance.

6. **Foreign Key Relationships**: Convex doesn't use traditional foreign keys. We need to ensure that relationships between tables are maintained through appropriate field references.

7. **Clerk Integration**: Both systems use Clerk for authentication. We need to ensure that the `clerk_user_id` is consistently used across the migration.

8. **Data Validation**: Convex uses schema validation. We need to ensure that all data from Vercel Postgres meets the validation requirements of the Convex schema.

## Migration Script

The current migration script (`scripts/migrate_vercel_to_convex.ts`) handles the basic migration of data. However, it may need to be updated to address the following:

- Handle the conversion of integer IDs to string IDs for Convex.
- Include any new fields that are in the Convex schema but not in the Vercel Postgres schema.
- Ensure that all data types are correctly mapped between the two systems.
- Handle any data transformations required by the Convex schema validation.

## Post-Migration Tasks

1. Verify data integrity after migration.
2. Update any application code that relies on the old database structure.
3. Test all functionality thoroughly to ensure the migration hasn't introduced any issues.
4. Update documentation to reflect the new data structure and any changes in querying or data management processes.

## Conclusion

This migration represents a significant change in the data storage and management approach. While the basic structure remains similar, the shift to Convex introduces new capabilities and constraints that need to be carefully managed throughout the migration process and in ongoing development.