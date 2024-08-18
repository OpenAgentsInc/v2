# Migration from Vercel Postgres to Convex

This document outlines the migration process from Vercel Postgres to Convex, including the original table structure, considerations for the migration, and the implementation of the migration script.

## Original Vercel Postgres Table Structure

[The original table structures remain unchanged, so I'm omitting them for brevity]

## Migration Considerations

1. **ID Fields**: Convex uses string IDs, while the Vercel Postgres tables use integer IDs. The migration script handles this conversion, especially for foreign key relationships.

2. **Timestamps**: Convex has built-in `createdAt` and `updatedAt` fields. We use these instead of custom timestamp fields.

3. **Schema Changes**: The Convex schema includes additional fields for users, such as `name` and `username`. These are derived from the email address during migration.

4. **Data Types**: Some data types have been adjusted. For example, `jsonb` fields in Postgres are mapped to appropriate Convex types.

5. **Indexes**: Convex handles indexing differently. Ensure that the necessary indexes are created in the Convex schema to maintain query performance.

6. **Foreign Key Relationships**: Convex doesn't use traditional foreign keys. The migration script maintains relationships between tables through appropriate field references.

7. **Clerk Integration**: Both systems use Clerk for authentication. The `clerk_user_id` is consistently used across the migration.

8. **Data Validation**: Convex uses schema validation. The migration script ensures that all data from Vercel Postgres meets the validation requirements of the Convex schema.

## Migration Script

The migration script (`scripts/migrate_vercel_to_convex.ts`) handles the migration of data from Vercel Postgres to Convex. Here are the key features of the script:

- It uses the `dotenv` package to load environment variables from `.env.local`.
- It connects to both the Vercel Postgres database and the Convex database.
- It migrates users, threads, and messages in that order to maintain data integrity.
- It handles the conversion of integer IDs to Convex's string IDs.
- It derives `name` and `username` fields for users from their email addresses.
- It maintains relationships between entities using Convex's ID system.

### Running the Migration Script

To run the migration script:

1. Ensure that your `.env.local` file contains the necessary environment variables, including `CONVEX_URL`.
2. Run the script using the following command:

   ```
   npx tsx scripts/migrate_vercel_to_convex.ts
   ```

3. Monitor the console output for any warnings or errors during the migration process.

## Post-Migration Tasks

1. Verify data integrity after migration:
   - Check that all users, threads, and messages have been migrated correctly.
   - Ensure that relationships between entities are maintained.
   - Verify that derived fields (like `name` and `username`) are populated correctly.

2. Update any application code that relies on the old database structure:
   - Replace Vercel Postgres queries with Convex queries.
   - Update any code that assumes integer IDs to work with Convex's string IDs.

3. Test all functionality thoroughly to ensure the migration hasn't introduced any issues:
   - Test user authentication and profile management.
   - Verify that threads and messages are displayed correctly.
   - Check that all CRUD operations work as expected with the new Convex backend.

4. Update documentation to reflect the new data structure and any changes in querying or data management processes.

5. Monitor application performance and adjust indexes in the Convex schema if necessary.

## Conclusion

This migration represents a significant change in the data storage and management approach. While the basic structure remains similar, the shift to Convex introduces new capabilities and constraints that need to be carefully managed throughout the migration process and in ongoing development.

The migration script provides a solid foundation for transferring data from Vercel Postgres to Convex, but it's crucial to thoroughly test and verify the migrated data and updated application code to ensure a smooth transition.