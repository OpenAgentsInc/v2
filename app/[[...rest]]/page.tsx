"use client"
import { Authenticated, Unauthenticated } from "convex/react"
import { HomeAuthed } from "@/components/home"
import { Lander } from "@/components/landing/Lander"
import ResetHUDButton from "@/components/ResetHUDButton"

export default function Page() {
  return (
    <>
      <Unauthenticated>
        <Lander />
      </Unauthenticated>
      <Authenticated>
        <ResetHUDButton />
        <HomeAuthed />
      </Authenticated>
    </>
  )
}
