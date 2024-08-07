"use server"

import { currentUser } from "@clerk/nextjs/server"
import { sql } from '@vercel/postgres'
import { seed } from "@/lib/db/seed"

export async function InitDatabase() {
    console.log("hello.")
    const user = await currentUser()
    console.log(user)

    let data

    try {
        await seed()
        data = await sql`SELECT * FROM users`
    } catch (e: any) {
        console.log("huh?")
        console.error(e)
        if (e.message.includes('relation "users" does not exist')) {
            console.log(
                'Table does not exist, creating and seeding it with dummy data now...'
            )
            // Table is not created yet
            data = await sql`SELECT * FROM users`
            console.log("Seeded.")
        } else {
            throw e
        }
    }

    console.log("[InitDatabase] Data:", data)

    return <></>
}
