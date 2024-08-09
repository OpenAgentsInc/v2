"use server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from '@vercel/postgres'
import { seed } from "@/lib/db/seed"

export async function InitDatabase() {
    console.log("Initializing database and fetching user threads...")
    const user = await currentUser()
    console.log("Current user:", user?.id)

    let userData
    let userThreads

    try {
        // Ensure database is seeded
        await seed()

        // Fetch user data
        userData = await sql`SELECT * FROM users WHERE clerk_user_id = ${user?.id}`

        if (userData.rows.length === 0) {
            console.log("User not found in database")
        } else {
            console.log("User found in database")

            // Fetch user threads
            userThreads = await sql`
                SELECT id, metadata, "createdAt"
                FROM threads
                WHERE clerk_user_id = ${user?.id}
                ORDER BY "createdAt" DESC
            `
            console.log(`Found ${userThreads.rows.length} threads for user`)
        }
    } catch (e: any) {
        console.error("Error in InitDatabase:", e)
        if (e.message.includes('relation "users" does not exist')) {
            console.log('Table does not exist, creating and seeding it with dummy data now...')
            await seed()
            userData = await sql`SELECT * FROM users WHERE clerk_user_id = ${user?.id}`
            console.log("Database seeded and user data fetched.")
        } else {
            throw e
        }
    }

    console.log("[InitDatabase] User Data:", userData?.rows)
    console.log("[InitDatabase] User Threads:", userThreads?.rows)

    return <></>  // Returning an empty fragment as per the original function
}
