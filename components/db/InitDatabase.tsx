"use server"

import { currentUser } from "@clerk/nextjs/server"

export async function InitDatabase() {
    console.log("hello.")
    const user = await currentUser()
    console.log(user)
    return <>{user.id}</>
}
