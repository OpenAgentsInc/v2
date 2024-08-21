"use server"

import { currentUser } from "@clerk/nextjs/server"

export async function authenticateUser() {
  const user = await currentUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  return user
}